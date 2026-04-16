namespace CyberSecureAR.Domain.Exceptions;

public class SecurityViolationException : Exception
{
    public string ViolationType { get; }

    public SecurityViolationException(string violationType, string message)
        : base(message)
    {
        ViolationType = violationType;
    }
}