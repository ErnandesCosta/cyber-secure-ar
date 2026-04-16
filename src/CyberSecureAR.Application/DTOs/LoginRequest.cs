namespace CyberSecureAR.Application.DTOs;

public record LoginRequest(
    string Username,
    string Password,
    string DeviceId
);