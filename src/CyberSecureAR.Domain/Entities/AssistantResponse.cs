using CyberSecureAR.Domain.Enums;

namespace CyberSecureAR.Domain.Entities;

public class AssistantResponse
{
    public Guid Id { get; private set; }
    public Guid QueryId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public bool WasFiltered { get; private set; }
    public AccessLevel AccessLevel { get; private set; }
    public DateTime GeneratedAt { get; private set; }

    private AssistantResponse() { }

    public static AssistantResponse Create(
        Guid queryId,
        string content,
        bool wasFiltered,
        AccessLevel accessLevel)
    {
        return new AssistantResponse
        {
            Id = Guid.NewGuid(),
            QueryId = queryId,
            Content = content,
            WasFiltered = wasFiltered,
            AccessLevel = accessLevel,
            GeneratedAt = DateTime.UtcNow
        };
    }
}