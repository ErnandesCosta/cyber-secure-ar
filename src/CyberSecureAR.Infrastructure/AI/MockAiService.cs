using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Infrastructure.AI;

public class MockAiService : IAIService
{
    public Task<string> GenerateResponseAsync(
        string question,
        IEnumerable<Document> context)
    {
        var docs = context.ToList();

        if (!docs.Any())
        {
            return Task.FromResult(
                "Não encontrei documentos autorizados relacionados à sua pergunta. " +
                "Verifique se você tem permissão para acessar essa informação."
            );
        }

        var response = "Com base nos documentos autorizados para seu perfil:\n\n";

        foreach (var doc in docs.Take(2))
        {
            var preview = doc.Content.Length > 300
                ? doc.Content[..300] + "..."
                : doc.Content;

            response += $"📄 **{doc.Title}**\n{preview}\n\n";
        }

        response += $"_(Resposta gerada com base em {docs.Count} documento(s) autorizado(s) para seu perfil.)_";

        return Task.FromResult(response);
    }
}