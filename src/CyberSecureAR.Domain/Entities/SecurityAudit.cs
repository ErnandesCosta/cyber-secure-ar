namespace CyberSecureAR.Domain.Entities;

public class SecurityAudit
{
    public Guid Id { get; private set; }
    public Guid? UserId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string Resource { get; private set; } = string.Empty;
    public bool WasAllowed { get; private set; }
    public string? BlockReason { get; private set; }
    public string IpAddress { get; private set; } = string.Empty;
    public string DeviceId { get; private set; } = string.Empty;
    public string CorrelationId { get; private set; } = string.Empty;
    public DateTime OccurredAt { get; private set; }

    private SecurityAudit() { }

    public static SecurityAudit Create(
        Guid? userId,
        string action,
        string resource,
        bool wasAllowed,
        string ipAddress,
        string deviceId,
        string? correlationId = null,
        string? blockReason = null)
    {
        return new SecurityAudit
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            Resource = resource,
            WasAllowed = wasAllowed,
            BlockReason = blockReason,
            IpAddress = ipAddress,
            DeviceId = deviceId,
            CorrelationId = string.IsNullOrWhiteSpace(correlationId)
                ? Guid.NewGuid().ToString()
                : correlationId,
            OccurredAt = DateTime.UtcNow
        };
    }
}