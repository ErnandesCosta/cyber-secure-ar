using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Infrastructure.Security;

public class AnomalyDetector : IAnomalyDetector
{
    private const int MaxBlockedInWindow = 5;   // mais de 5 bloqueios = anomalia
    private const int MaxRequestsInWindow = 30; // mais de 30 requests = anomalia
    private const int WindowMinutes = 5;

    // Ações geradas pelo polling do dashboard — não devem disparar anomalia
    private static readonly HashSet<string> _ignoredActions =
        new(StringComparer.OrdinalIgnoreCase) { "HTTP_GET", "HTTP_OPTIONS" };

    public Task<AnomalyResult> AnalyzeAsync(string deviceId, IEnumerable<SecurityAudit> recentAudits)
    {
        var window = DateTime.UtcNow.AddMinutes(-WindowMinutes);

        var auditsInWindow = recentAudits
            .Where(a =>
                a.DeviceId == deviceId &&
                a.OccurredAt >= window &&
                !_ignoredActions.Contains(a.Action))
            .ToList();

        var totalRequests = auditsInWindow.Count;
        var blockedCount  = auditsInWindow.Count(a => !a.WasAllowed);

        if (totalRequests > MaxRequestsInWindow)
        {
            var score = Math.Clamp(50 + (totalRequests - MaxRequestsInWindow) * 5, 0, 100);
            return Task.FromResult(new AnomalyResult(
                IsAnomaly: true,
                AnomalyScore: score,
                Reason: $"Rate limit excedido: {totalRequests} requisições em {WindowMinutes} minutos"
            ));
        }

        if (blockedCount > MaxBlockedInWindow)
        {
            var score = Math.Clamp(60 + blockedCount * 10, 0, 100);
            return Task.FromResult(new AnomalyResult(
                IsAnomaly: true,
                AnomalyScore: score,
                Reason: $"Bloqueios repetidos: {blockedCount} tentativas negadas em {WindowMinutes} minutos"
            ));
        }

        return Task.FromResult(new AnomalyResult(
            IsAnomaly: false,
            AnomalyScore: 0,
            Reason: string.Empty
        ));
    }
}
