using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CyberSecureAR.Infrastructure.Logging;

public class AuditService(ILogger<AuditService> logger) : IAuditService
{
    private readonly List<SecurityAudit> _audits = [];

    public Task LogAsync(SecurityAudit audit)
    {
        _audits.Add(audit);

        // Loga de forma estruturada para observabilidade
        if (audit.WasAllowed)
        {
            logger.LogInformation(
                "[AUDIT] Action={Action} Resource={Resource} UserId={UserId} " +
                "Device={DeviceId} IP={IpAddress} Allowed={Allowed}",
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
                "[AUDIT] Action={Action} Resource={Resource} UserId={UserId} " +
                "Device={DeviceId} IP={IpAddress} Allowed={Allowed} Reason={Reason}",
                audit.Action,
                audit.Resource,
                audit.UserId,
                audit.DeviceId,
                audit.IpAddress,
                audit.WasAllowed,
                audit.BlockReason
            );
        }

        return Task.CompletedTask;
    }

    public Task<IEnumerable<SecurityAudit>> GetByUserIdAsync(Guid userId)
    {
        var result = _audits.Where(a => a.UserId == userId);
        return Task.FromResult(result);
    }
}