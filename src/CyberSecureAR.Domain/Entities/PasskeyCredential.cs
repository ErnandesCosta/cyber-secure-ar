namespace CyberSecureAR.Domain.Entities;

public class PasskeyCredential
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Label { get; private set; } = string.Empty;
    public byte[] CredentialId { get; private set; } = [];
    public byte[] PublicKey { get; private set; } = [];
    public uint SignatureCounter { get; private set; }
    public string[] Transports { get; private set; } = [];
    public bool IsBackupEligible { get; private set; }
    public bool IsBackedUp { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastUsedAt { get; private set; }

    private PasskeyCredential() { }

    public static PasskeyCredential Create(
        Guid userId,
        string label,
        byte[] credentialId,
        byte[] publicKey,
        uint signatureCounter,
        string[] transports,
        bool isBackupEligible,
        bool isBackedUp)
    {
        ArgumentNullException.ThrowIfNull(credentialId);
        ArgumentNullException.ThrowIfNull(publicKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(label);

        return new PasskeyCredential
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Label = label,
            CredentialId = credentialId,
            PublicKey = publicKey,
            SignatureCounter = signatureCounter,
            Transports = transports,
            IsBackupEligible = isBackupEligible,
            IsBackedUp = isBackedUp,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateUsage(uint signatureCounter, bool isBackedUp)
    {
        SignatureCounter = signatureCounter;
        IsBackedUp = isBackedUp;
        LastUsedAt = DateTime.UtcNow;
    }
}
