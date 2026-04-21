using System.Text;
using System.IdentityModel.Tokens.Jwt;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Application.UseCases;
using CyberSecureAR.API.Models;
using CyberSecureAR.API.Services;
using CyberSecureAR.Infrastructure.AI;
using CyberSecureAR.Infrastructure.Auth;
using CyberSecureAR.Infrastructure.Logging;
using CyberSecureAR.Infrastructure.Persistence;
using CyberSecureAR.Infrastructure.Security;
using Fido2NetLib;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace CyberSecureAR.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<TokenConfiguration>(
            configuration.GetSection("TokenConfiguration")
        );
        services.Configure<PasskeyOptions>(
            configuration.GetSection("Passkeys")
        );

        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddSingleton<IUserRepository, InMemoryUserRepository>();
        services.AddSingleton<IPasskeyRepository, InMemoryPasskeyRepository>();
        services.AddSingleton<IDocumentRepository, InMemoryDocumentRepository>();
        services.AddScoped<IAIService, MockAiService>();
        services.AddScoped<ISensitiveDataFilter, SensitiveDataFilter>();
        services.AddSingleton<IAuditService, AuditService>();
        services.AddSingleton<IDeviceBlockService, DeviceBlockService>();
        services.AddSingleton<IAnomalyDetector, AnomalyDetector>();
        services.AddSingleton<PasskeyOperationStore>();
        services.AddSingleton(sp =>
        {
            var options = configuration.GetSection("Passkeys").Get<PasskeyOptions>()
                ?? new PasskeyOptions();

            return new Fido2(new Fido2Configuration
            {
                ServerDomain = options.ServerDomain,
                ServerName = options.ServerName,
                Origins = new HashSet<string>(options.Origins)
            });
        });

        return services;
    }

    public static IServiceCollection AddUseCases(this IServiceCollection services)
    {
        services.AddScoped<AuthenticateUserUseCase>();
        services.AddScoped<QueryAssistantUseCase>();
        services.AddScoped<FilterResponseUseCase>();
        return services;
    }

    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var tokenConfig = configuration
            .GetSection("TokenConfiguration")
            .Get<TokenConfiguration>()!;

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(tokenConfig.SecretKey)
                    ),
                    ValidateIssuer = true,
                    ValidIssuer = tokenConfig.Issuer,
                    ValidateAudience = true,
                    ValidAudience = tokenConfig.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    NameClaimType = "username",
                    RoleClaimType = "role"
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = ctx =>
                    {
                        if (string.IsNullOrWhiteSpace(ctx.Token)
                            && ctx.Request.Query.TryGetValue("access_token", out var tokenValues))
                        {
                            ctx.Token = tokenValues.FirstOrDefault();
                        }
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = ctx =>
                    {
                        ctx.Response.Headers.Append("Token-Expired", "true");
                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }
}
