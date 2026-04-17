using System.Linq;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.API.Middleware;

public class AuditMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IAuditService auditService)
    {
        var path          = context.Request.Path.ToString();
        var method        = context.Request.Method;
        var ip            = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var deviceId      = context.Request.Headers["X-Device-Id"].FirstOrDefault() ?? "unknown";
        var correlationId = context.Request.Headers["X-Correlation-Id"].FirstOrDefault()
                            ?? context.TraceIdentifier;

        context.Response.Headers["X-Correlation-Id"] = correlationId;

        await next(context);

        // Loga somente rotas da API (não health checks)
        if (path.StartsWith("/api"))
        {
            var statusCode = context.Response.StatusCode;
            var allowed    = statusCode < 400;

            Guid? userId = null;
            var userIdClaim = context.User?.FindFirst("sub")?.Value;
            if (Guid.TryParse(userIdClaim, out var parsedId))
                userId = parsedId;

            await auditService.LogAsync(SecurityAudit.Create(
                userId:      userId,
                action:      $"HTTP_{method}",
                resource:    path,
                wasAllowed:  allowed,
                ipAddress:   ip,
                deviceId:    deviceId,
                correlationId: correlationId,
                blockReason: allowed ? null : $"HTTP {statusCode}"
            ));
        }
    }
}