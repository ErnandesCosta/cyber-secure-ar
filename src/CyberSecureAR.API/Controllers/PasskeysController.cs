using System.Security.Claims;
using System.Text;
using CyberSecureAR.API.Services;
using CyberSecureAR.Application.DTOs;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;
using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;

namespace CyberSecureAR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PasskeysController(
    Fido2 fido2,
    IUserRepository userRepository,
    IPasskeyRepository passkeyRepository,
    PasskeyOperationStore passkeyOperationStore,
    ITokenService tokenService,
    IAuditService auditService) : ControllerBase
{
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<PasskeyCredentialDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCredentials()
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized();
        }

        var credentials = await passkeyRepository.GetByUserIdAsync(user.Id);
        return Ok(credentials.Select(MapCredential));
    }

    [HttpPost("registration/options")]
    [Authorize]
    public async Task<IActionResult> BeginRegistration([FromBody] BeginPasskeyRegistrationRequest? request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized();
        }

        var existingKeys = await passkeyRepository.GetByUserIdAsync(user.Id);
        var label = string.IsNullOrWhiteSpace(request?.Label)
            ? $"Passkey {existingKeys.Count + 1}"
            : request!.Label.Trim();

        var options = fido2.RequestNewCredential(new RequestNewCredentialParams
        {
            User = new Fido2User
            {
                DisplayName = user.FullName,
                Name = user.Username,
                Id = Encoding.UTF8.GetBytes(user.Id.ToString())
            },
            ExcludeCredentials = existingKeys
                .Select(item => new PublicKeyCredentialDescriptor(item.CredentialId))
                .ToList(),
            AuthenticatorSelection = new AuthenticatorSelection
            {
                AuthenticatorAttachment = AuthenticatorAttachment.Platform,
                ResidentKey = ResidentKeyRequirement.Preferred,
                UserVerification = UserVerificationRequirement.Required
            },
            AttestationPreference = AttestationConveyancePreference.None,
            Extensions = new AuthenticationExtensionsClientInputs
            {
                CredProps = true
            }
        });

        passkeyOperationStore.SetRegistrationOptions(user.Id, label, options.ToJson());
        return Ok(options);
    }

    [HttpPost("registration/verify")]
    [Authorize]
    [ProducesResponseType(typeof(PasskeyCredentialDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> FinishRegistration([FromBody] AuthenticatorAttestationRawResponse response)
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized();
        }

        var operation = passkeyOperationStore.TakeRegistrationOptions(user.Id);
        if (operation is null)
        {
            return BadRequest("Nenhum desafio de registro pendente.");
        }

        var options = CredentialCreateOptions.FromJson(operation.OptionsJson);

        IsCredentialIdUniqueToUserAsyncDelegate callback = async (args, cancellationToken) =>
        {
            var existingCredential = await passkeyRepository.GetByCredentialIdAsync(args.CredentialId);
            return existingCredential is null;
        };

        var result = await fido2.MakeNewCredentialAsync(new MakeNewCredentialParams
        {
            AttestationResponse = response,
            OriginalOptions = options,
            IsCredentialIdUniqueToUserCallback = callback
        });

        var credential = PasskeyCredential.Create(
            userId: user.Id,
            label: operation.Label,
            credentialId: result.Id,
            publicKey: result.PublicKey,
            signatureCounter: result.SignCount,
            transports: [],
            isBackupEligible: result.IsBackupEligible,
            isBackedUp: result.IsBackedUp);

        await passkeyRepository.AddAsync(credential);
        await auditService.LogAsync(SecurityAudit.Create(
            userId: user.Id,
            action: "PASSKEY_REGISTERED",
            resource: "passkeys/register",
            wasAllowed: true,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            deviceId: Request.Headers["X-Device-Id"].FirstOrDefault() ?? "unknown",
            correlationId: Request.Headers["X-Correlation-Id"].FirstOrDefault() ?? HttpContext.TraceIdentifier));

        return Ok(MapCredential(credential));
    }

    [HttpPost("authentication/options")]
    [AllowAnonymous]
    public async Task<IActionResult> BeginAuthentication([FromBody] BeginPasskeyAuthenticationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest("Informe um usuário para autenticar com passkey.");
        }

        var user = await userRepository.GetByUsernameAsync(request.Username.Trim());
        if (user is null)
        {
            return BadRequest("Usuário não encontrado.");
        }

        var credentials = await passkeyRepository.GetByUserIdAsync(user.Id);
        if (credentials.Count == 0)
        {
            return BadRequest("Este usuário ainda não possui passkeys cadastradas.");
        }

        var options = fido2.GetAssertionOptions(new GetAssertionOptionsParams
        {
            AllowedCredentials = credentials
                .Select(item => new PublicKeyCredentialDescriptor(item.CredentialId))
                .ToList(),
            UserVerification = UserVerificationRequirement.Required,
            Extensions = new AuthenticationExtensionsClientInputs
            {
                Extensions = true
            }
        });

        passkeyOperationStore.SetAssertionOptions(user.Username, options.ToJson());
        return Ok(options);
    }

    [HttpPost("authentication/verify")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> FinishAuthentication([FromBody] VerifyPasskeyAuthenticationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest("Usuário é obrigatório.");
        }

        var user = await userRepository.GetByUsernameAsync(request.Username.Trim());
        if (user is null)
        {
            return BadRequest("Usuário não encontrado.");
        }

        var jsonOptions = passkeyOperationStore.TakeAssertionOptions(user.Username);
        if (string.IsNullOrWhiteSpace(jsonOptions))
        {
            return BadRequest("Nenhum desafio de autenticação pendente.");
        }

        var options = AssertionOptions.FromJson(jsonOptions);
        var credential = await passkeyRepository.GetByCredentialIdAsync(request.Response.RawId);
        if (credential is null || credential.UserId != user.Id)
        {
            return BadRequest("Credencial não encontrada para este usuário.");
        }

        IsUserHandleOwnerOfCredentialIdAsync callback = async (args, cancellationToken) =>
        {
            var userCredentials = await passkeyRepository.GetByUserIdAsync(user.Id);
            return userCredentials.Any(item => item.CredentialId.SequenceEqual(args.CredentialId));
        };

        var result = await fido2.MakeAssertionAsync(new MakeAssertionParams
        {
            AssertionResponse = request.Response,
            OriginalOptions = options,
            StoredPublicKey = credential.PublicKey,
            StoredSignatureCounter = credential.SignatureCounter,
            IsUserHandleOwnerOfCredentialIdCallback = callback
        });

        credential.UpdateUsage(result.SignCount, result.IsBackedUp);
        await passkeyRepository.UpdateAsync(credential);

        var deviceId = Request.Headers["X-Device-Id"].FirstOrDefault() ?? "unknown";
        var correlationId = Request.Headers["X-Correlation-Id"].FirstOrDefault() ?? HttpContext.TraceIdentifier;
        var token = tokenService.GenerateToken(user, deviceId);

        await auditService.LogAsync(SecurityAudit.Create(
            userId: user.Id,
            action: "PASSKEY_AUTH_SUCCESS",
            resource: "passkeys/authenticate",
            wasAllowed: true,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            deviceId: deviceId,
            correlationId: correlationId));

        return Ok(new LoginResponse(
            Token: token,
            FullName: user.FullName,
            Role: user.Role.ToString(),
            Department: user.Department,
            ExpiresAt: DateTime.UtcNow.AddHours(8)));
    }

    [HttpDelete("{credentialId}")]
    [Authorize]
    public async Task<IActionResult> DeleteCredential(string credentialId)
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized();
        }

        await passkeyRepository.RemoveAsync(user.Id, WebEncoders.Base64UrlDecode(credentialId));
        return NoContent();
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var claimValue = User.FindFirst("sub")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(claimValue, out var userId)
            ? await userRepository.GetByIdAsync(userId)
            : null;
    }

    private static PasskeyCredentialDto MapCredential(PasskeyCredential credential) =>
        new(
            CredentialId: WebEncoders.Base64UrlEncode(credential.CredentialId),
            Label: credential.Label,
            SignatureCounter: credential.SignatureCounter,
            Transports: credential.Transports,
            IsBackupEligible: credential.IsBackupEligible,
            IsBackedUp: credential.IsBackedUp,
            CreatedAt: credential.CreatedAt,
            LastUsedAt: credential.LastUsedAt);
}

public record BeginPasskeyRegistrationRequest(string? Label);

public record BeginPasskeyAuthenticationRequest(string Username);

public record VerifyPasskeyAuthenticationRequest(
    string Username,
    AuthenticatorAssertionRawResponse Response);
