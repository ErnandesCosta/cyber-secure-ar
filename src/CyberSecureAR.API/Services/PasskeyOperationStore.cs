using System.Collections.Concurrent;

namespace CyberSecureAR.API.Services;

public class PasskeyOperationStore
{
    private readonly ConcurrentDictionary<Guid, RegistrationOperation> _registrationOptions = new();
    private readonly ConcurrentDictionary<string, string> _assertionOptions = new(StringComparer.OrdinalIgnoreCase);

    public void SetRegistrationOptions(Guid userId, string label, string optionsJson)
    {
        _registrationOptions[userId] = new RegistrationOperation(label, optionsJson);
    }

    public RegistrationOperation? TakeRegistrationOptions(Guid userId)
    {
        _registrationOptions.TryRemove(userId, out var operation);
        return operation;
    }

    public void SetAssertionOptions(string username, string optionsJson)
    {
        _assertionOptions[username] = optionsJson;
    }

    public string? TakeAssertionOptions(string username)
    {
        _assertionOptions.TryRemove(username, out var optionsJson);
        return optionsJson;
    }
}

public record RegistrationOperation(string Label, string OptionsJson);
