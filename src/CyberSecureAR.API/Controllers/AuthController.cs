using CyberSecureAR.Application.DTOs;
using CyberSecureAR.Application.UseCases;
using CyberSecureAR.API.Models;
using CyberSecureAR.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSecureAR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthenticateUserUseCase authenticateUserUseCase) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var response = await authenticateUserUseCase.ExecuteAsync(request, ip);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiErrorResponse.Create("VALIDATION_ERROR", ex.Message, 400));
        }
        catch (UnauthorizedDomainAccessException ex)
        {
            return Unauthorized(ApiErrorResponse.Create("UNAUTHORIZED", ex.Message, 401));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiErrorResponse.Create("INTERNAL_ERROR", ex.Message, 500));
        }
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Me()
    {
        var userId     = User.FindFirst("sub")?.Value;
        var username   = User.FindFirst("username")?.Value;
        var fullName   = User.FindFirst("fullName")?.Value;
        var department = User.FindFirst("department")?.Value;
        var role       = User.FindFirst("role")?.Value;

        var profile = new UserProfileDto(
            Id:         Guid.Parse(userId!),
            Username:   username!,
            FullName:   fullName!,
            Department: department!,
            Role:       role!
        );

        return Ok(profile);
    }
}