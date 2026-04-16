using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.Enums;

namespace CyberSecureAR.Infrastructure.Persistence;

public class InMemoryUserRepository : IUserRepository
{
    private readonly List<User> _users;

    public InMemoryUserRepository()
    {
        // Usuários de teste para a demo
        _users =
        [
            User.Create(
                username: "tecnico.joao",
                passwordHash: BCrypt.Net.BCrypt.HashPassword("Tecnico@123"),
                fullName: "João Silva",
                department: "Operação de Campo",
                role: UserRole.Technician
            ),
            User.Create(
                username: "especialista.ana",
                passwordHash: BCrypt.Net.BCrypt.HashPassword("Especialista@123"),
                fullName: "Ana Souza",
                department: "Engenharia",
                role: UserRole.Specialist
            ),
            User.Create(
                username: "gestor.carlos",
                passwordHash: BCrypt.Net.BCrypt.HashPassword("Gestor@123"),
                fullName: "Carlos Menezes",
                department: "Diretoria Operacional",
                role: UserRole.Manager
            )
        ];
    }

    public Task<User?> GetByUsernameAsync(string username)
    {
        var user = _users.FirstOrDefault(u =>
            u.Username.Equals(username, StringComparison.OrdinalIgnoreCase)
        );
        return Task.FromResult(user);
    }

    public Task<User?> GetByIdAsync(Guid id)
    {
        var user = _users.FirstOrDefault(u => u.Id == id);
        return Task.FromResult(user);
    }
}