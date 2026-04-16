using CyberSecureAR.API.Extensions;
using CyberSecureAR.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "CyberSecureAR API",
        Version = "v1",
        Description = "API segura para acesso corporativo via smart glasses"
    });

    // Suporte a Bearer token no Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description  = "Informe o token JWT no formato: Bearer {token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS para o React
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactClient", policy =>
    {
        policy
            .WithOrigins(
                builder.Configuration
                    .GetSection("Cors:AllowedOrigins")
                    .Get<string[]>() ?? ["http://localhost:3000"]
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Clean Architecture layers
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddUseCases();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSecurityPolicies();

var app = builder.Build();

// Middlewares na ordem certa
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CyberSecureAR v1");
    c.RoutePrefix = string.Empty; // Swagger na raiz
});

app.UseCors("ReactClient");
app.UseMiddleware<SecurityMiddleware>();
app.UseMiddleware<AuditMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();