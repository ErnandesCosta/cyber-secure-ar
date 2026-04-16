using CyberSecureAR.Domain.Enums;
using CyberSecureAR.Domain.ValueObjects;

namespace CyberSecureAR.Infrastructure.Security;

public class AccessPolicyEvaluator
{
    public bool CanAccessDocument(AccessClaim claim, DocumentClassification classification)
    {
        if (!claim.DeviceTrusted)
            return false;

        return claim.CanAccess(classification);
    }

    public bool IsDeviceTrusted(string deviceId)
    {
        // No MVP todos dispositivos com deviceId válido são considerados confiáveis
        // Em produção: validar contra lista de dispositivos aprovados
        return !string.IsNullOrWhiteSpace(deviceId);
    }

    public string GetDenialReason(AccessClaim claim, DocumentClassification classification)
    {
        if (!claim.DeviceTrusted)
            return "Dispositivo não confiável.";

        return $"Perfil '{claim.Role}' não tem permissão para acessar documentos '{classification}'.";
    }
}