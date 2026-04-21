namespace CyberSecureAR.API.Models;

public class PasskeyOptions
{
    public string ServerDomain { get; set; } = "localhost";
    public string ServerName { get; set; } = "CyberSecure AR";
    public string[] Origins { get; set; } = ["http://localhost:5173"];
}
