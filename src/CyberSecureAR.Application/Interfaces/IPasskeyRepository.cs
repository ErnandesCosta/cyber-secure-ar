using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Application.Interfaces;

public interface IPasskeyRepository
{
    Task<IReadOnlyCollection<PasskeyCredential>> GetByUserIdAsync(Guid userId);
    Task<PasskeyCredential?> GetByCredentialIdAsync(byte[] credentialId);
    Task AddAsync(PasskeyCredential credential);
    Task RemoveAsync(Guid userId, byte[] credentialId);
    Task UpdateAsync(PasskeyCredential credential);
}
