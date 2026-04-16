using CyberSecureAR.Application.DTOs;

namespace CyberSecureAR.Application.Validators;

public static class LoginRequestValidator
{
    private const int MinPasswordLength = 6;
    private const int MaxUsernameLength = 50;

    public static (bool IsValid, string? Error) Validate(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
            return (false, "Username é obrigatório.");

        if (request.Username.Length > MaxUsernameLength)
            return (false, $"Username não pode ter mais de {MaxUsernameLength} caracteres.");

        if (string.IsNullOrWhiteSpace(request.Password))
            return (false, "Password é obrigatório.");

        if (request.Password.Length < MinPasswordLength)
            return (false, $"Password deve ter ao menos {MinPasswordLength} caracteres.");

        if (string.IsNullOrWhiteSpace(request.DeviceId))
            return (false, "DeviceId é obrigatório.");

        return (true, null);
    }
}