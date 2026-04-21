using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Infrastructure.Persistence;
using Xunit;

namespace CyberSecureAR.Tests.Unit;

public class SecurityTests
{
    [Fact]
    public void PasskeyCredentialCreateInitializesRequiredSecurityFields()
    {
        var userId = Guid.NewGuid();
        var credentialId = new byte[] { 1, 2, 3 };
        var publicKey = new byte[] { 4, 5, 6 };

        var credential = PasskeyCredential.Create(
            userId,
            "Windows Hello",
            credentialId,
            publicKey,
            12,
            ["internal"],
            isBackupEligible: true,
            isBackedUp: false);

        Assert.NotEqual(Guid.Empty, credential.Id);
        Assert.Equal(userId, credential.UserId);
        Assert.Equal("Windows Hello", credential.Label);
        Assert.Equal(credentialId, credential.CredentialId);
        Assert.Equal(publicKey, credential.PublicKey);
        Assert.Equal((uint)12, credential.SignatureCounter);
        Assert.Contains("internal", credential.Transports);
        Assert.True(credential.IsBackupEligible);
        Assert.False(credential.IsBackedUp);
        Assert.True(credential.CreatedAt <= DateTime.UtcNow);
        Assert.Null(credential.LastUsedAt);
    }

    [Fact]
    public void PasskeyCredentialUpdateUsageRefreshesCounterAndLastUsedDate()
    {
        var credential = PasskeyCredential.Create(
            Guid.NewGuid(),
            "Phone",
            [7, 8, 9],
            [10, 11, 12],
            1,
            [],
            isBackupEligible: false,
            isBackedUp: false);

        credential.UpdateUsage(22, isBackedUp: true);

        Assert.Equal((uint)22, credential.SignatureCounter);
        Assert.True(credential.IsBackedUp);
        Assert.NotNull(credential.LastUsedAt);
        Assert.True(credential.LastUsedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task InMemoryPasskeyRepositoryStoresFindsUpdatesAndRemovesCredentials()
    {
        var repository = new InMemoryPasskeyRepository();
        var userId = Guid.NewGuid();
        var credential = PasskeyCredential.Create(
            userId,
            "Security key",
            [1, 3, 5],
            [2, 4, 6],
            0,
            ["usb"],
            isBackupEligible: false,
            isBackedUp: false);

        await repository.AddAsync(credential);

        var userCredentials = await repository.GetByUserIdAsync(userId);
        var foundByCredentialId = await repository.GetByCredentialIdAsync([1, 3, 5]);

        Assert.Single(userCredentials);
        Assert.Same(credential, foundByCredentialId);

        credential.UpdateUsage(3, isBackedUp: true);
        await repository.UpdateAsync(credential);

        var updated = await repository.GetByCredentialIdAsync([1, 3, 5]);
        Assert.NotNull(updated);
        Assert.Equal((uint)3, updated.SignatureCounter);
        Assert.True(updated.IsBackedUp);

        await repository.RemoveAsync(userId, [1, 3, 5]);

        Assert.Empty(await repository.GetByUserIdAsync(userId));
    }
}
