using CyberSecureAR.Domain.Enums;

namespace CyberSecureAR.Domain.ValueObjects;

public record AccessClaim(
    Guid UserId,
    string Username,
    string FullName,
    string Department,
    UserRole Role,
    string DeviceId,
    bool DeviceTrusted
)
{
    public bool CanAccess(DocumentClassification classification)
    {
        if (!DeviceTrusted) return false;

        return classification switch
        {
            DocumentClassification.Public => true,
            DocumentClassification.Internal => Role >= UserRole.Technician,
            DocumentClassification.Restricted => Role >= UserRole.Specialist,
            DocumentClassification.Confidential => Role == UserRole.Manager,
            _ => false
        };
    }
}