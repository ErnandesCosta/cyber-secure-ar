using System.Security.Claims;
using CyberSecureAR.API.Models;
using CyberSecureAR.Application.DTOs;
using CyberSecureAR.Application.UseCases;
using CyberSecureAR.Domain.Enums;
using CyberSecureAR.Domain.Exceptions;
using CyberSecureAR.Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSecureAR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssistantController(
    QueryAssistantUseCase queryAssistantUseCase
) : ControllerBase
{
    [HttpPost("query")]
    [ProducesResponseType(typeof(AssistantResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Query([FromBody] AssistantQueryDto dto)
    {
        try
        {
            var claim = ExtractClaim();
            if (claim is null)
                return Unauthorized(ApiErrorResponse.Create(
                    "UNAUTHORIZED", "Token inválido ou expirado.", 401));

            var ip       = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var response = await queryAssistantUseCase.ExecuteAsync(dto, claim, ip);

            return Ok(response);
        }
        catch (SecurityViolationException ex)
        {
            return BadRequest(ApiErrorResponse.Create(ex.ViolationType, ex.Message, 400));
        }
        catch (UnauthorizedDomainAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiErrorResponse.Create("INTERNAL_ERROR", ex.Message, 500));
        }
    }

    private AccessClaim? ExtractClaim()
    {
        // Debug — mostra todos os claims que chegam
        foreach (var c in User.Claims)
            Console.WriteLine($"[CLAIM] {c.Type} = {c.Value}");

        // Tenta sub direto, depois o formato longo do .NET
        var userId = User.FindFirst("sub")?.Value
                  ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var username      = User.FindFirst("username")?.Value;
        var fullName      = User.FindFirst("fullName")?.Value;
        var department    = User.FindFirst("department")?.Value;
        var role          = User.FindFirst("role")?.Value;
        var deviceId      = User.FindFirst("deviceId")?.Value;
        var deviceTrusted = User.FindFirst("deviceTrusted")?.Value;

        Console.WriteLine($"[DEBUG] userId={userId} | role={role} | deviceId={deviceId}");

        if (userId is null || role is null)
            return null;

        if (!Guid.TryParse(userId, out var parsedId))
            return null;

        if (!Enum.TryParse<UserRole>(role, out var parsedRole))
            return null;

        return new AccessClaim(
            UserId:        parsedId,
            Username:      username      ?? string.Empty,
            FullName:      fullName      ?? string.Empty,
            Department:    department    ?? string.Empty,
            Role:          parsedRole,
            DeviceId:      deviceId      ?? "unknown",
            DeviceTrusted: bool.Parse(deviceTrusted ?? "false")
        );
    }
}