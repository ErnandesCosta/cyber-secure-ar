using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(SecurityAudit audit);
    Task<IEnumerable<SecurityAudit>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<SecurityAudit>> GetAllAsync();
}