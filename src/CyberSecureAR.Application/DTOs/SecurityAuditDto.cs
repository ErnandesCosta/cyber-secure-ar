namespace CyberSecureAR.Application.DTOs;

public record SecurityAuditDto(
    Guid Id,
    Guid? UserId,
    string Action,
    string Resource,
    bool WasAllowed,
    string? BlockReason,
    string IpAddress,
    string DeviceId,
    string CorrelationId,
    DateTime OccurredAt
);
