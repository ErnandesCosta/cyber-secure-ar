namespace CyberSecureAR.Domain.Entities;

public class BlockedDevice
{
    public Guid   Id        { get; private set; }
    public string DeviceId  { get; private set; } = string.Empty;
    public string Reason    { get; private set; } = string.Empty;
    public int    RiskScore { get; private set; }
    public DateTime BlockedAt { get; private set; }

    private BlockedDevice() { }

    public static BlockedDevice Create(string deviceId, string reason, int riskScore) =>
        new()
        {
            Id        = Guid.NewGuid(),
            DeviceId  = deviceId,
            Reason    = reason,
            RiskScore = riskScore,
            BlockedAt = DateTime.UtcNow,
        };
}
