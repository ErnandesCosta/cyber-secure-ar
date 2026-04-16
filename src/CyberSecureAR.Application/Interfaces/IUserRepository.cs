using CyberSecureAR.Domain.Entities;

namespace CyberSecureAR.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByIdAsync(Guid id);
}