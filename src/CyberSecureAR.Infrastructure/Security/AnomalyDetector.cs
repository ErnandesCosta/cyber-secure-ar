using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Infrastructure.Security;

public class AnomalyDetector : IAnomalyDetector
{
    // Limites de anomalia
    private const int MaxBlockedInWindow  = 3;   // mais de 3 bloqueios = anomalia
    private const int MaxRequestsInWindow = 20;  // mais de 20 requests = anomalia
    private const int WindowMinutes       = 5;   // janela de 5 minutos

    public Task<AnomalyResult> AnalyzeAsync(string deviceId, IEnumerable<SecurityAudit> recentAudits)
    {
        var window = DateTime.UtcNow.AddMinutes(-WindowMinutes);
        var auditsInWindow = recentAudits
            .Where(a => a.DeviceId == deviceId && a.OccurredAt >= window)
            .ToList();

        var totalRequests = auditsInWindow.Count;
        var blockedCount  = auditsInWindow.Count(a => !a.WasAllowed);

        // Verifica rate limit
        if (totalRequests > MaxRequestsInWindow)
        {
            var score = Math.Clamp(50 + (totalRequests - MaxRequestsInWindow) * 5, 0, 100);
            return Task.FromResult(new AnomalyResult(
                IsAnomaly:    true,
                AnomalyScore: score,
                Reason:       $"Rate limit excedido: {totalRequests} requisições em {WindowMinutes} minutos"
            ));
        }

        // Verifica bloqueios repetidos
        if (blockedCount > MaxBlockedInWindow)
        {
            var score = Math.Clamp(60 + blockedCount * 10, 0, 100);
            return Task.FromResult(new AnomalyResult(
                IsAnomaly:    true,
                AnomalyScore: score,
                Reason:       $"Bloqueios repetidos: {blockedCount} tentativas negadas em {WindowMinutes} minutos"
            ));
        }

        return Task.FromResult(new AnomalyResult(
            IsAnomaly:    false,
            AnomalyScore: 0,
            Reason:       string.Empty
        ));
    }
}
