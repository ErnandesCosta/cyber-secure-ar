using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Infrastructure.Persistence;

public class InMemoryPasskeyRepository : IPasskeyRepository
{
    private readonly List<PasskeyCredential> _credentials = [];

    public Task<IReadOnlyCollection<PasskeyCredential>> GetByUserIdAsync(Guid userId)
    {
        var credentials = _credentials
            .Where(item => item.UserId == userId)
            .ToArray();

        return Task.FromResult<IReadOnlyCollection<PasskeyCredential>>(credentials);
    }

    public Task<PasskeyCredential?> GetByCredentialIdAsync(byte[] credentialId)
    {
        var credential = _credentials.FirstOrDefault(item =>
            item.CredentialId.SequenceEqual(credentialId));

        return Task.FromResult(credential);
    }

    public Task AddAsync(PasskeyCredential credential)
    {
        _credentials.Add(credential);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(Guid userId, byte[] credentialId)
    {
        var credential = _credentials.FirstOrDefault(item =>
            item.UserId == userId && item.CredentialId.SequenceEqual(credentialId));

        if (credential is not null)
        {
            _credentials.Remove(credential);
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(PasskeyCredential credential)
    {
        var index = _credentials.FindIndex(item => item.Id == credential.Id);
        if (index >= 0)
        {
            _credentials[index] = credential;
        }

        return Task.CompletedTask;
    }
}
