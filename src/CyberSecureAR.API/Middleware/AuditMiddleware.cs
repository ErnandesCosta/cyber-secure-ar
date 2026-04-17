using System.Linq;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.API.Middleware;

public class AuditMiddleware(RequestDelegate next)
{
    // Rotas de polling do dashboard — não devem gerar audit log (geraria falso positivo no AnomalyDetector)
    private static readonly HashSet<string> _pollingPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/audit/events",
        "/api/audit/summary",
        "/api/audit/trends",
        "/api/audit/incidents",
        "/api/security/blocked-devices",
        "/api/auth/me"
    };

    public async Task InvokeAsync(HttpContext context, IAuditService auditService)
    {
        var path         = context.Request.Path.ToString();
        var method       = context.Request.Method;
        var ip           = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var deviceId     = context.Request.Headers["X-Device-Id"].FirstOrDefault() ?? "unknown";
        var correlationId = context.Request.Headers["X-Correlation-Id"].FirstOrDefault()
                           ?? context.TraceIdentifier;

        context.Response.Headers["X-Correlation-Id"] = correlationId;

        await next(context);

        // Loga somente rotas da API relevantes (não health checks, não polling do dashboard)
        if (path.StartsWith("/api") && !_pollingPaths.Contains(path))
        {
            var statusCode = context.Response.StatusCode;
            var allowed    = statusCode < 400;

            Guid? userId = null;
            var userIdClaim = context.User?.FindFirst("sub")?.Value;
            if (Guid.TryParse(userIdClaim, out var parsedId))
                userId = parsedId;

            await auditService.LogAsync(SecurityAudit.Create(
                userId: userId,
                action: $"HTTP_{method}",
                resource: path,
                wasAllowed: allowed,
                ipAddress: ip,
                deviceId: deviceId,
                correlationId: correlationId,
                blockReason: allowed ? null : $"HTTP {statusCode}"
            ));
        }
    }
}
