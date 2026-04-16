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

        var result = _documents
            .Where(d => d.Classification <= maxClassification)
            .Where(d =>
                d.Title.ToLowerInvariant().Contains(lower) ||
                d.Content.ToLowerInvariant().Contains(lower) ||
                d.Category.ToLowerInvariant().Contains(lower)
            );

        return Task.FromResult(result);
    }
}