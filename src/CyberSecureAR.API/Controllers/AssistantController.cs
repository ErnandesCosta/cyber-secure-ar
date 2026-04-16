using CyberSecureAR.Application.DTOs;
using CyberSecureAR.Application.UseCases;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.API.Models;
using CyberSecureAR.Domain.Exceptions;
using CyberSecureAR.Domain.ValueObjects;
using CyberSecureAR.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSecureAR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssistantController(
    QueryAssistantUseCase queryAssistantUseCase,
    ITokenService tokenService
) : ControllerBase
{
    [HttpPost("query")]
    [ProducesResponseType(typeof(AssistantResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Query([FromBody] AssistantQueryDto dto)
    {
        try
        {
            // Extrai claims do token JWT
            var claim = ExtractClaim();
            if (claim is null)
                return Unauthorized(ApiErrorResponse.Create(
                    "UNAUTHORIZED", "Token inválido ou expirado.", 401));

            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var response = await queryAssistantUseCase.ExecuteAsync(dto, claim, ip);

            return Ok(response);
        }
        catch (SecurityViolationException ex)
        {
            return BadRequest(ApiErrorResponse.Create(
                ex.ViolationType, ex.Message, 400));
        }
        catch (UnauthorizedDomainAccessException ex)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiErrorResponse.Create(
                "INTERNAL_ERROR", ex.Message, 500));
        }
    }

    private AccessClaim? ExtractClaim()
    {
        var userId     = User.FindFirst("sub")?.Value;
        var username   = User.FindFirst("username")?.Value;
        var fullName   = User.FindFirst("fullName")?.Value;
        var department = User.FindFirst("department")?.Value;
        var role       = User.FindFirst("role")?.Value;
        var deviceId   = User.FindFirst("deviceId")?.Value;
        var trusted    = User.FindFirst("deviceTrusted")?.Value;

        if (userId is null || role is null) return null;

        return new AccessClaim(
            UserId:        Guid.Parse(userId),
            Username:      username!,
            FullName:      fullName!,
            Department:    department!,
            Role:          Enum.Parse<UserRole>(role),
            DeviceId:      deviceId ?? "unknown",
            DeviceTrusted: bool.Parse(trusted ?? "false")
        );
    }
}