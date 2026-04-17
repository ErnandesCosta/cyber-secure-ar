namespace CyberSecureAR.Application.DTOs;

public record AuditIncidentDto(
    string CorrelationId,
    Guid? UserId,
    string DeviceId,
    string Resource,
    int TotalEvents,
    int BlockedEvents,
    int Severity,
    DateTime LastOccurredAt
);
