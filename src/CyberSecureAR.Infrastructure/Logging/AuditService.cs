using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CyberSecureAR.Infrastructure.Logging;

public class AuditService(ILogger<AuditService> logger) : IAuditService
{
    private readonly List<SecurityAudit> _audits = [];
    private readonly object _lock = new();

    public event Action<SecurityAudit>? AuditLogged;

    public Task LogAsync(SecurityAudit audit)
    {
        lock (_lock)
        {
            _audits.Add(audit);
        }

        // Loga de forma estruturada para observabilidade
        if (audit.WasAllowed)
        {
            logger.LogInformation(
                "[AUDIT] CorrelationId={CorrelationId} Action={Action} Resource={Resource} UserId={UserId} " +
                "Device={DeviceId} IP={IpAddress} Allowed={Allowed}",
                audit.CorrelationId,
                audit.Action,
                audit.Resource,
                audit.UserId,
                audit.DeviceId,
                audit.IpAddress,
                audit.WasAllowed
            );
        }
        else
        {
            logger.LogWarning(
                "[AUDIT] CorrelationId={CorrelationId} Action={Action} Resource={Resource} UserId={UserId} " +
                "Device={DeviceId} IP={IpAddress} Allowed={Allowed} Reason={Reason}",
                audit.CorrelationId,
                audit.Action,
                audit.Resource,
                audit.UserId,
                audit.DeviceId,
                audit.IpAddress,
                audit.WasAllowed,
                audit.BlockReason
            );
        }

        AuditLogged?.Invoke(audit);

        return Task.CompletedTask;
    }

    public Task<IEnumerable<SecurityAudit>> GetByUserIdAsync(Guid userId)
    {
        IEnumerable<SecurityAudit> result;
        lock (_lock)
        {
            result = _audits.Where(a => a.UserId == userId).ToList();
        }
        return Task.FromResult(result);
    }

    public Task<IEnumerable<SecurityAudit>> GetAllAsync()
    {
        IEnumerable<SecurityAudit> result;
        lock (_lock)
        {
            result = _audits.ToList();
        }
        return Task.FromResult(result);
    }
}