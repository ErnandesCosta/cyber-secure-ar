namespace CyberSecureAR.API.Middleware;

public class SecurityMiddleware(RequestDelegate next)
{
    // Limite simples de tamanho de body para evitar abuso
    private const long MaxBodySize = 1_048_576; // 1MB

    public async Task InvokeAsync(HttpContext context)
    {
        // Adiciona headers de segurança em toda resposta
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Append("Referrer-Policy", "no-referrer");
        context.Response.Headers.Append(
            "Content-Security-Policy",
            "default-src 'self'"
        );

        // Verifica tamanho do body
        if (context.Request.ContentLength > MaxBodySize)
        {
            context.Response.StatusCode = StatusCodes.Status413RequestEntityTooLarge;
            await context.Response.WriteAsJsonAsync(new
            {
                error   = "Payload muito grande.",
                maxSize = "1MB"
            });
            return;
        }

        // Verifica DeviceId em rotas protegidas
        if (context.Request.Path.StartsWithSegments("/api/assistant"))
        {
            var deviceId = context.Request.Headers["X-Device-Id"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(deviceId))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsJsonAsync(new
                {
                    error   = "Header X-Device-Id é obrigatório.",
                    message = "Dispositivo não identificado."
                });
                return;
            }
        }

        await next(context);
    }
}