using System.Text.RegularExpressions;
using CyberSecureAR.Application.Interfaces;

namespace CyberSecureAR.Infrastructure.Security;

public class SensitiveDataFilter : ISensitiveDataFilter
{
    // Padrões de dados sensíveis que nunca devem aparecer na resposta
    private static readonly (Regex Pattern, string Replacement)[] FilterRules =
    [
        // CPF: 000.000.000-00
        (new Regex(@"\d{3}\.\d{3}\.\d{3}-\d{2}", RegexOptions.Compiled), "[CPF REMOVIDO]"),

        // CNPJ: 00.000.000/0000-00
        (new Regex(@"\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}", RegexOptions.Compiled), "[CNPJ REMOVIDO]"),

        // Senhas explícitas
        (new Regex(@"(senha|password|passwd)\s*[:=]\s*\S+",
            RegexOptions.Compiled | RegexOptions.IgnoreCase), "[CREDENCIAL REMOVIDA]"),

        // Tokens e API Keys
        (new Regex(@"(token|api[_-]?key|secret|chave)\s*[:=]\s*\S+",
            RegexOptions.Compiled | RegexOptions.IgnoreCase), "[TOKEN REMOVIDO]"),

        // IPs internos
        (new Regex(@"\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", RegexOptions.Compiled), "[IP INTERNO REMOVIDO]"),
        (new Regex(@"\b192\.168\.\d{1,3}\.\d{1,3}\b", RegexOptions.Compiled), "[IP INTERNO REMOVIDO]"),
        (new Regex(@"\b172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b", RegexOptions.Compiled), "[IP INTERNO REMOVIDO]"),

        // Emails corporativos
        (new Regex(@"[a-zA-Z0-9._%+-]+@petrobras\.com\.br", RegexOptions.Compiled), "[EMAIL CORPORATIVO REMOVIDO]"),

        // Padrões de porta + host
        (new Regex(@"porta\s*\d{2,5}", RegexOptions.Compiled | RegexOptions.IgnoreCase), "[PORTA REMOVIDA]"),
        (new Regex(@"host\s*\S+", RegexOptions.Compiled | RegexOptions.IgnoreCase), "[HOST REMOVIDO]"),
    ];

    private static readonly string[] SensitiveKeywords =
    [
        "senha", "password", "passwd", "credencial", "credential",
        "api key", "api_key", "secret", "token rotativo",
        "usuário admin", "user admin"
    ];

    public string Filter(string content)
    {
        var result = content;

        foreach (var (pattern, replacement) in FilterRules)
            result = pattern.Replace(result, replacement);

        return result;
    }

    public bool ContainsSensitiveData(string content)
    {
        var lower = content.ToLowerInvariant();

        if (SensitiveKeywords.Any(k => lower.Contains(k)))
            return true;

        return FilterRules.Any(r => r.Pattern.IsMatch(content));
    }
}