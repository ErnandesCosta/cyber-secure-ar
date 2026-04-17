using System.Linq;
using System.Security.Claims;
using CyberSecureAR.Application.DTOs;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSecureAR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuditController(IAuditService auditService) : ControllerBase
{
    [HttpGet("events")]
    [ProducesResponseType(typeof(IEnumerable<SecurityAuditDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetEvents()
    {
        var userIdClaim = User.FindFirst("sub")?.Value
                      ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var role = User.FindFirst("role")?.Value ?? string.Empty;
        var audits = role.Equals("Manager", StringComparison.OrdinalIgnoreCase)
            ? await auditService.GetAllAsync()
            : await auditService.GetByUserIdAsync(userId);

        var result = audits
            .OrderByDescending(a => a.OccurredAt)
            .Take(20)
            .Select(a => new SecurityAuditDto(
                a.Id,
                a.UserId,
                a.Action,
                a.Resource,
                a.WasAllowed,
                a.BlockReason,
                a.IpAddress,
                a.DeviceId,
                a.OccurredAt
            ));

        return Ok(result);
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(AuditSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSummary()
    {
        var userIdClaim = User.FindFirst("sub")?.Value
                      ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var role = User.FindFirst("role")?.Value ?? string.Empty;
        var audits = role.Equals("Manager", StringComparison.OrdinalIgnoreCase)
            ? await auditService.GetAllAsync()
            : await auditService.GetByUserIdAsync(userId);

        var totalEvents = audits.Count();
        var blockedEvents = audits.Count(a => !a.WasAllowed);
        var allowedEvents = totalEvents - blockedEvents;
        var riskScore = RoleBasedRisk(role, blockedEvents, totalEvents);

        var topActions = audits
            .GroupBy(a => a.Action)
            .Select(g => new AuditActionMetricDto(g.Key, g.Count()))
            .OrderByDescending(g => g.Count)
            .Take(5);

        return Ok(new AuditSummaryDto(
            TotalEvents: totalEvents,
            AllowedEvents: allowedEvents,
            BlockedEvents: blockedEvents,
            RiskScore: riskScore,
            TopActions: topActions
        ));
    }

    private static int RoleBasedRisk(string role, int blockedEvents, int totalEvents)
    {
        if (totalEvents == 0)
            return 5;

        var ratio = blockedEvents / (double)totalEvents;
        var baseScore = role.Equals("Manager", StringComparison.OrdinalIgnoreCase) ? 30 : 50;
        var score = baseScore + (int)Math.Round(ratio * 50);
        return Math.Clamp(score, 0, 100);
    }
}
