namespace CyberSecureAR.API.Models;

public record ApiErrorResponse(
    string Error,
    string Message,
    int StatusCode,
    DateTime Timestamp
)
{
    public static ApiErrorResponse Create(string error, string message, int statusCode) =>
        new(error, message, statusCode, DateTime.UtcNow);
};