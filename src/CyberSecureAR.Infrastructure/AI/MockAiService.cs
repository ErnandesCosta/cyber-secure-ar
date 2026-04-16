using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.Enums;

namespace CyberSecureAR.Infrastructure.AI;

public class MockAiService : IAIService
{
    public Task<string> GenerateResponseAsync(
        string question,
        IEnumerable<Document> context)
    {
        var docs = context.ToList();

        if (!docs.Any())
            return Task.FromResult(
                "Não encontrei documentos autorizados para sua pergunta. " +
                "Você pode não ter permissão para acessar essa informação."
            );

        var response = $"Com base nos documentos autorizados para seu perfil:\n\n";

        foreach (var doc in docs.Take(3))
        {
            var classLabel = doc.Classification switch
            {
                DocumentClassification.Public       => "🟢 Público",
                DocumentClassification.Internal     => "🔵 Interno",
                DocumentClassification.Restricted   => "🟡 Restrito",
                DocumentClassification.Confidential => "🔴 Confidencial",
                _ => "Desconhecido"
            };

            var preview = doc.Content.Length > 250
                ? doc.Content[..250] + "..."
                : doc.Content;

            response += $"📄 **{doc.Title}** [{classLabel}]\n";
            response += $"{preview}\n\n";
        }

        response += $"---\n";
        response += $"🔒 Exibindo {Math.Min(docs.Count, 3)} de {docs.Count} " +
                    $"documento(s) autorizado(s) para seu perfil.";

        return Task.FromResult(response);
    }
}
