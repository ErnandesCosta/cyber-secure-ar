using CyberSecureAR.Domain.Enums;

namespace CyberSecureAR.Domain.Entities;

public class Document
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public DocumentClassification Classification { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Document() { }

    public static Document Create(
        string title,
        string content,
        string category,
        DocumentClassification classification)
    {
        ArgumentException.ThrowIfNullOrEmpty(title);
        ArgumentException.ThrowIfNullOrEmpty(content);

        return new Document
        {
            Id = Guid.NewGuid(),
            Title = title,
            Content = content,
            Category = category,
            Classification = classification,
            CreatedAt = DateTime.UtcNow
        };
    }
}