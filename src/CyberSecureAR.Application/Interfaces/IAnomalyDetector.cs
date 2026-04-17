using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Application.Interfaces;

public interface IAnomalyDetector
{
    Task<AnomalyResult> AnalyzeAsync(string deviceId, IEnumerable<SecurityAudit> recentAudits);
}

public record AnomalyResult(
    bool   IsAnomaly,
    int    AnomalyScore,
    string Reason
);
