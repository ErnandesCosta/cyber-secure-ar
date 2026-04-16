namespace CyberSecureAR.Application.Validators;

public static class QueryValidator
{
    private const int MaxQuestionLength = 500;

    // Padrões conhecidos de prompt injection
    private static readonly string[] InjectionPatterns =
    [
        "ignore previous",
        "ignore as instruções",
        "ignore all instructions",
        "disregard",
        "forget everything",
        "esqueça tudo",
        "you are now",
        "você agora é",
        "act as",
        "aja como",
        "pretend",
        "fingir",
        "jailbreak",
        "bypass",
        "override",
        "system prompt",
        "prompt interno",
        "instrução interna",
        "reveal your instructions",
        "mostre suas instruções",
        "what are your instructions",
        "quais são suas instruções",
        "sudo",
        "admin mode",
        "developer mode",
        "modo desenvolvedor",
        "DAN",
        "do anything now"
    ];

    // Padrões de tentativa de extração de dados
    private static readonly string[] ExtractionPatterns =
    [
        "senha",
        "password",
        "credencial",
        "credential",
        "token",
        "api key",
        "chave de api",
        "secret",
        "segredo",
        "cpf",
        "rg",
        "dados pessoais",
        "personal data",
        "confidencial",
        "confidential",
        "restrito",
        "restricted"
    ];

    public static (bool IsValid, string? Error) Validate(string question)
    {
        if (string.IsNullOrWhiteSpace(question))
            return (false, "A pergunta não pode ser vazia.");

        if (question.Length > MaxQuestionLength)
            return (false, $"A pergunta não pode ter mais de {MaxQuestionLength} caracteres.");

        var lower = question.ToLowerInvariant();

        foreach (var pattern in InjectionPatterns)
        {
            if (lower.Contains(pattern))
                return (false, $"Pergunta bloqueada por política de segurança.");
        }

        return (true, null);
    }

    public static bool HasExtractionIntent(string question)
    {
        var lower = question.ToLowerInvariant();
        return ExtractionPatterns.Any(p => lower.Contains(p));
    }
}