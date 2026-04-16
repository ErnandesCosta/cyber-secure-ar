using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.Enums;

namespace CyberSecureAR.Application.Interfaces;

public interface IDocumentRepository
{
    Task<IEnumerable<Document>> GetByClassificationAsync(
        DocumentClassification maxClassification
    );
    Task<IEnumerable<Document>> SearchAsync(
        string query,
        DocumentClassification maxClassification
    );
}