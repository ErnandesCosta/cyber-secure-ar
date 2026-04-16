namespace CyberSecureAR.API.Extensions;

public static class AuthorizationExtensions
{
    public static IServiceCollection AddSecurityPolicies(
        this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // Qualquer usuário autenticado
            options.AddPolicy("AuthenticatedUser", policy =>
                policy.RequireAuthenticatedUser()
            );

            // Especialista ou acima
            options.AddPolicy("SpecialistOrAbove", policy =>
                policy.RequireClaim("role", "Specialist", "Manager")
            );

            // Somente gestor
            options.AddPolicy("ManagerOnly", policy =>
                policy.RequireClaim("role", "Manager")
            );
        });

        return services;
    }
}