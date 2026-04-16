using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.Enums;

namespace CyberSecureAR.Infrastructure.Persistence;

public class InMemoryDocumentRepository : IDocumentRepository
{
    private readonly List<Document> _documents = DocumentsData.GetSeedDocuments();

    public Task<IEnumerable<Document>> GetByClassificationAsync(
        DocumentClassification maxClassification)
    {
        var result = _documents
            .Where(d => d.Classification <= maxClassification);
        return Task.FromResult(result);
    }

    public Task<IEnumerable<Document>> SearchAsync(
        string query,
        DocumentClassification maxClassification)
    {
        var lower = query.ToLowerInvariant();
        var words = lower.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                         .Where(w => w.Length > 3)
                         .ToList();

        // Documentos autorizados para esse perfil
        var authorized = _documents
            .Where(d => d.Classification <= maxClassification)
            .ToList();

        // Busca por relevância dentro dos autorizados
        var matched = authorized
            .Where(d =>
            {
                var titleLower   = d.Title.ToLowerInvariant();
                var contentLower = d.Content.ToLowerInvariant();
                var catLower     = d.Category.ToLowerInvariant();

                // Match exato na query completa
                if (titleLower.Contains(lower) ||
                    contentLower.Contains(lower) ||
                    catLower.Contains(lower))
                    return true;

                // Match por palavras individuais
                return words.Any(w =>
                    titleLower.Contains(w) ||
                    contentLower.Contains(w) ||
                    catLower.Contains(w));
            })
            .ToList();

        // Se não encontrou match, não retorna documentos adicionais.
        // Isso evita vazamento de contexto para consultas genéricas ou fora do escopo.
        return Task.FromResult<IEnumerable<Document>>(matched);
    }
}
