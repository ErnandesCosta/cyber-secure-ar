using System.Text;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Application.UseCases;
using CyberSecureAR.Infrastructure.AI;
using CyberSecureAR.Infrastructure.Auth;
using CyberSecureAR.Infrastructure.Logging;
using CyberSecureAR.Infrastructure.Persistence;
using CyberSecureAR.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace CyberSecureAR.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Token config
        services.Configure<TokenConfiguration>(
            configuration.GetSection("TokenConfiguration")
        );

        // Auth
        services.AddScoped<ITokenService, JwtTokenService>();

        // Repositories
        services.AddSingleton<IUserRepository, InMemoryUserRepository>();
        services.AddSingleton<IDocumentRepository, InMemoryDocumentRepository>();

        // AI
        services.AddScoped<IAIService, MockAiService>();

        // Security
        services.AddScoped<ISensitiveDataFilter, SensitiveDataFilter>();

        // Audit — Singleton para persistir logs em memória durante a sessão
        services.AddSingleton<IAuditService, AuditService>();

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
                options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(tokenConfig.SecretKey)
                    ),
                    ValidateIssuer   = true,
                    ValidIssuer      = tokenConfig.Issuer,
                    ValidateAudience = true,
                    ValidAudience    = tokenConfig.Audience,
                    ValidateLifetime = true,
                    ClockSkew        = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
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