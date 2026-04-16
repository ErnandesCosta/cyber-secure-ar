namespace CyberSecureAR.Application.Interfaces;

public interface ISensitiveDataFilter
{
    string Filter(string content);
    bool ContainsSensitiveData(string content);
}