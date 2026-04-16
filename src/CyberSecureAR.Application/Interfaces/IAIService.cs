using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Application.Interfaces;

public interface IAIService
{
    Task<string> GenerateResponseAsync(
        string question,
        IEnumerable<Document> context
    );
}