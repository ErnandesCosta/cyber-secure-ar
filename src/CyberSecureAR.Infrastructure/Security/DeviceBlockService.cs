using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CyberSecureAR.Infrastructure.Security;

public class DeviceBlockService(ILogger<DeviceBlockService> logger) : IDeviceBlockService
{
    private readonly List<BlockedDevice> _blocked = [];
    private readonly object _lock = new();

    public Task BlockAsync(string deviceId, string reason, int riskScore)
    {
        lock (_lock)
        {
            // Não bloqueia duplicado
            if (_blocked.Any(b => b.DeviceId == deviceId))
                return Task.CompletedTask;

            var device = BlockedDevice.Create(deviceId, reason, riskScore);
            _blocked.Add(device);
        }

        logger.LogWarning(
            "[BLOCK] DeviceId={DeviceId} Reason={Reason} RiskScore={RiskScore}",
            deviceId, reason, riskScore);

        return Task.CompletedTask;
    }

    public Task<bool> IsBlockedAsync(string deviceId)
    {
        bool blocked;
        lock (_lock)
        {
            blocked = _blocked.Any(b => b.DeviceId == deviceId);
        }
        return Task.FromResult(blocked);
    }

    public Task<IEnumerable<BlockedDevice>> GetAllBlockedAsync()
    {
        IEnumerable<BlockedDevice> result;
        lock (_lock)
        {
            result = _blocked.ToList();
        }
        return Task.FromResult(result);
    }

    public Task UnblockAsync(string deviceId)
    {
        lock (_lock)
        {
            _blocked.RemoveAll(b => b.DeviceId == deviceId);
        }

        logger.LogInformation("[UNBLOCK] DeviceId={DeviceId}", deviceId);
        return Task.CompletedTask;
    }
}
