namespace CyberSecureAR.Domain.ValueObjects;

public record QueryContext(
    string Question,
    string DeviceId,
    string IpAddress,
    bool IsFromTrustedNetwork
);