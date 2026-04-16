using CyberSecureAR.Domain.Enums;

namespace CyberSecureAR.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Username { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string Department { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private User() { }

    public static User Create(
        string username,
        string passwordHash,
        string fullName,
        string department,
        UserRole role)
    {
        ArgumentException.ThrowIfNullOrEmpty(username);
        ArgumentException.ThrowIfNullOrEmpty(passwordHash);
        ArgumentException.ThrowIfNullOrEmpty(fullName);
        ArgumentException.ThrowIfNullOrEmpty(department);

        return new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            PasswordHash = passwordHash,
            FullName = fullName,
            Department = department,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    public bool HasAccessTo(DocumentClassification classification)
    {
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