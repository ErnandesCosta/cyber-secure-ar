namespace CyberSecureAR.Application.DTOs;

public record BlockedDeviceDto(
    Guid     Id,
    string   DeviceId,
    string   Reason,
    int      RiskScore,
    DateTime BlockedAt
);
