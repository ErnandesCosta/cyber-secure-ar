using CyberSecureAR.Application.DTOs;
using CyberSecureAR.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSecureAR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SecurityController(
    IDeviceBlockService deviceBlockService,
    IAuditService       auditService,
    IAnomalyDetector    anomalyDetector) : ControllerBase
{
    // GET api/security/blocked-devices
    [HttpGet("blocked-devices")]
    [ProducesResponseType(typeof(IEnumerable<BlockedDeviceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBlockedDevices()
    {
        var devices = await deviceBlockService.GetAllBlockedAsync();
        var result  = devices.Select(d => new BlockedDeviceDto(
            d.Id, d.DeviceId, d.Reason, d.RiskScore, d.BlockedAt));
        return Ok(result);
    }

    // DELETE api/security/blocked-devices/{deviceId}
    [HttpDelete("blocked-devices/{deviceId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UnblockDevice(string deviceId)
    {
        await deviceBlockService.UnblockAsync(deviceId);
        return NoContent();
    }

    // GET api/security/anomalies/{deviceId}
    [HttpGet("anomalies/{deviceId}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckAnomaly(string deviceId)
    {
        var allAudits = await auditService.GetAllAsync();
        var result    = await anomalyDetector.AnalyzeAsync(deviceId, allAudits);
        return Ok(new
        {
            deviceId,
            result.IsAnomaly,
            result.AnomalyScore,
            result.Reason,
            checkedAt = DateTime.UtcNow
        });
    }
}
