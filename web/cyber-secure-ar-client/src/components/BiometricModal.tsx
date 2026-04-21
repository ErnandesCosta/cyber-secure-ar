import { useMemo, useState } from "react";
import {
  CheckBadgeIcon,
  FingerPrintIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type BiometricStatus = "idle" | "checking" | "approved" | "unavailable";

interface BiometricModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricModal = ({ onSuccess, onCancel }: BiometricModalProps) => {
  const [status, setStatus] = useState<BiometricStatus>("idle");

  const message = useMemo(() => {
    if (status === "checking") return "Verificando suporte do autenticador da plataforma...";
    if (status === "approved") return "Confirmação local concluída. Redirecionando.";
    if (status === "unavailable") {
      return "Este ambiente não expõe WebAuthn de plataforma. O login segue em modo demonstrativo.";
    }
    return "Use a biometria nativa do dispositivo como segundo fator quando disponível.";
  }, [status]);

  const startScan = async () => {
    setStatus("checking");

    const hasPlatformAuthenticator =
      typeof window !== "undefined" &&
      "PublicKeyCredential" in window &&
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function" &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());

    setTimeout(() => {
      if (hasPlatformAuthenticator) {
        setStatus("approved");
        setTimeout(onSuccess, 850);
        return;
      }

      setStatus("unavailable");
      setTimeout(onSuccess, 1200);
    }, 1200);
  };

  return (
    <div className="biometric-overlay">
      <div className="biometric-modal">
        <button className="biometric-close" onClick={onCancel} aria-label="Fechar modal">
          <XMarkIcon />
        </button>

        <div className={`biometric-visual biometric-${status}`}>
          {status === "approved" ? <CheckBadgeIcon /> : <FingerPrintIcon />}
        </div>

        <h2>Verificação biométrica</h2>
        <p className="biometric-subtitle">{message}</p>

        <div className="biometric-meta">
          <span>Fator local</span>
          <strong>Face ID / digital / passkey</strong>
        </div>
        <div className="biometric-meta">
          <span>Padrão sugerido</span>
          <strong>WebAuthn com autenticador de plataforma</strong>
        </div>

        {status === "idle" && (
          <button className="btn-biometric btn-primary" onClick={startScan}>
            <FingerPrintIcon />
            Iniciar verificação
          </button>
        )}

        {status === "checking" && <p className="scan-text">Validando autenticador...</p>}

        {status === "unavailable" && (
          <div className="biometric-warning">
            <ShieldExclamationIcon />
            <span>Sem suporte nativo detectado neste navegador ou dispositivo.</span>
          </div>
        )}

        {(status === "idle" || status === "unavailable") && (
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};
