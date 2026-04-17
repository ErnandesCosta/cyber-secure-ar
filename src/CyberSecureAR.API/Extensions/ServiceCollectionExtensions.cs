using System.Text;
using System.IdentityModel.Tokens.Jwt;
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
        services.Configure<TokenConfiguration>(
            configuration.GetSection("TokenConfiguration")
        );

        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddSingleton<IUserRepository, InMemoryUserRepository>();
        services.AddSingleton<IDocumentRepository, InMemoryDocumentRepository>();
        services.AddScoped<IAIService, MockAiService>();
        services.AddScoped<ISensitiveDataFilter, SensitiveDataFilter>();
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
                // CHAVE DA CORREÇÃO — desabilita remapeamento interno do JwtBearer
                options.MapInboundClaims = false;

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
                    ClockSkew        = TimeSpan.Zero,
                    // Garante que os nomes dos claims não são remapeados
                    NameClaimType    = "username",
                    RoleClaimType    = "role"
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
