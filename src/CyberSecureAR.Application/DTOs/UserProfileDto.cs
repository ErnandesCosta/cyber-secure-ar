namespace CyberSecureAR.Application.DTOs;

public record UserProfileDto(
    Guid Id,
    string Username,
    string FullName,
    string Department,
    string Role
);