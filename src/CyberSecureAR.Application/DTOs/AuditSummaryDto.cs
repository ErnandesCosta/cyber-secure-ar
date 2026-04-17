namespace CyberSecureAR.Application.DTOs;

public record AuditActionMetricDto(
    string Action,
    int Count
);

public record AuditSummaryDto(
    int TotalEvents,
    int AllowedEvents,
    int BlockedEvents,
    int RiskScore,
    IEnumerable<AuditActionMetricDto> TopActions
);
