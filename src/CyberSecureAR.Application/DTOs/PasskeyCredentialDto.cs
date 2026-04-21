namespace CyberSecureAR.Application.DTOs;

public record PasskeyCredentialDto(
    string CredentialId,
    string Label,
    uint SignatureCounter,
    string[] Transports,
    bool IsBackupEligible,
    bool IsBackedUp,
    DateTime CreatedAt,
    DateTime? LastUsedAt
);
