using CyberSecureAR.Application.Interfaces;

namespace CyberSecureAR.Application.UseCases;

public class FilterResponseUseCase(ISensitiveDataFilter sensitiveDataFilter)
{
    public (string Content, bool WasFiltered) Execute(string rawContent)
    {
        if (sensitiveDataFilter.ContainsSensitiveData(rawContent))
        {
            var filtered = sensitiveDataFilter.Filter(rawContent);
            return (filtered, true);
        }

        return (rawContent, false);
    }
}