namespace CyberSecureAR.Domain.Enums;

public enum DocumentClassification
{
    Public = 1,         // Qualquer usuário autenticado
    Internal = 2,       // Técnico ou acima
    Restricted = 3,     // Especialista ou acima
    Confidential = 4    // Somente Gestor
}