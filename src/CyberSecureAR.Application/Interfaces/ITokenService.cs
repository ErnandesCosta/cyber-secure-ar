using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.ValueObjects;

namespace CyberSecureAR.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user, string deviceId);
    AccessClaim? ValidateToken(string token);
}