using CyberSecureAR.Application.DTOs;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Application.Validators;
using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.Exceptions;

namespace CyberSecureAR.Application.UseCases;

public class AuthenticateUserUseCase(
    IUserRepository userRepository,
    ITokenService tokenService,
    IAuditService auditService
)
{
    public async Task<LoginResponse> ExecuteAsync(
        LoginRequest request,
        string ipAddress,
        string correlationId)
    {
        // Valida o request
        var (isValid, error) = LoginRequestValidator.Validate(request);
        if (!isValid)
            throw new ArgumentException(error);

        // Busca o usuário
        var user = await userRepository.GetByUsernameAsync(request.Username);

        // Verifica usuário e senha
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            await auditService.LogAsync(SecurityAudit.Create(
                userId: null,
                action: "LOGIN_FAILED",
                resource: "auth/login",
                wasAllowed: false,
                ipAddress: ipAddress,
                deviceId: request.DeviceId,
                correlationId: correlationId,
                blockReason: "Credenciais inválidas"
            ));

            throw new UnauthorizedDomainAccessException(
                "auth/login",
                "Credenciais inválidas"
            );
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedDomainAccessException(
                "auth/login",
                "Usuário inativo"
            );
        }

        // Gera token com claims
        var token = tokenService.GenerateToken(user, request.DeviceId);

        await auditService.LogAsync(SecurityAudit.Create(
            userId: user.Id,
            action: "LOGIN_SUCCESS",
            resource: "auth/login",
            wasAllowed: true,
            ipAddress: ipAddress,
            deviceId: request.DeviceId,
            correlationId: correlationId
        ));

        return new LoginResponse(
            Token: token,
            FullName: user.FullName,
            Role: user.Role.ToString(),
            Department: user.Department,
            ExpiresAt: DateTime.UtcNow.AddHours(8)
        );
    }
}