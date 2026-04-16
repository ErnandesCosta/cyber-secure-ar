namespace CyberSecureAR.Domain.Entities;

public class AssistantQuery
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Question { get; private set; } = string.Empty;
    public string DeviceId { get; private set; } = string.Empty;
    public DateTime AskedAt { get; private set; }

    private AssistantQuery() { }

    public static AssistantQuery Create(Guid userId, string question, string deviceId)
    {
        ArgumentException.ThrowIfNullOrEmpty(question);

        return new AssistantQuery
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Question = question,
            DeviceId = deviceId ?? "unknown",
            AskedAt = DateTime.UtcNow
        };
    }
}