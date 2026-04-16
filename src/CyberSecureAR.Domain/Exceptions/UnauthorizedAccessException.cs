namespace CyberSecureAR.Domain.Exceptions;

public class UnauthorizedDomainAccessException : Exception
{
    public UnauthorizedDomainAccessException(string message)
        : base(message) { }

    public UnauthorizedDomainAccessException(string resource, string reason)
        : base($"Acesso negado ao recurso '{resource}': {reason}") { }
}