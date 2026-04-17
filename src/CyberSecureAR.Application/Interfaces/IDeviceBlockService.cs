using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Application.Interfaces;

public interface IDeviceBlockService
{
    Task BlockAsync(string deviceId, string reason, int riskScore);
    Task<bool> IsBlockedAsync(string deviceId);
    Task<IEnumerable<BlockedDevice>> GetAllBlockedAsync();
    Task UnblockAsync(string deviceId);
}
