using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.Enums;
using CyberSecureAR.Domain.ValueObjects;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CyberSecureAR.Infrastructure.Auth;

public class JwtTokenService(IOptions<TokenConfiguration> config) : ITokenService
{
    private readonly TokenConfiguration _config = config.Value;

    public string GenerateToken(User user, string deviceId)
    {
        JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
        JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim("sub",           user.Id.ToString()),
            new Claim("jti",           Guid.NewGuid().ToString()),
            new Claim("username",      user.Username),
            new Claim("fullName",      user.FullName),
            new Claim("department",    user.Department),
            new Claim("role",          user.Role.ToString()),
            new Claim("deviceId",      deviceId),
            new Claim("deviceTrusted", "true")
        };

        var token = new JwtSecurityToken(
            issuer:             _config.Issuer,
            audience:           _config.Audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(_config.ExpirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public AccessClaim? ValidateToken(string token)
    {
        try
        {
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

            var handler = new JwtSecurityTokenHandler();
            var key     = Encoding.UTF8.GetBytes(_config.SecretKey);

            handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = new SymmetricSecurityKey(key),
                ValidateIssuer           = true,
                ValidIssuer              = _config.Issuer,
                ValidateAudience         = true,
                ValidAudience            = _config.Audience,
                ValidateLifetime         = true,
                ClockSkew                = TimeSpan.Zero
            }, out var validatedToken);

            var jwt = (JwtSecurityToken)validatedToken;

            return new AccessClaim(
                UserId:        Guid.Parse(jwt.Claims.First(c => c.Type == "sub").Value),
                Username:      jwt.Claims.First(c => c.Type == "username").Value,
                FullName:      jwt.Claims.First(c => c.Type == "fullName").Value,
                Department:    jwt.Claims.First(c => c.Type == "department").Value,
                Role:          Enum.Parse<UserRole>(jwt.Claims.First(c => c.Type == "role").Value),
                DeviceId:      jwt.Claims.First(c => c.Type == "deviceId").Value,
                DeviceTrusted: bool.Parse(jwt.Claims.First(c => c.Type == "deviceTrusted").Value)
            );
        }
        catch
        {
            return null;
        }
    }
}