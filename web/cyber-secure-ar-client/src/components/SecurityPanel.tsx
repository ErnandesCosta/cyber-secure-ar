import { useState } from "react";
import { useBlockedDevices } from "../hooks/useBlockedDevices";

export const SecurityPanel = () => {
  const { devices, isLoading, error, unblock } = useBlockedDevices();
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [unblockSuccess, setUnblockSuccess] = useState<string | null>(null);
  const [unblockError, setUnblockError] = useState<string | null>(null);

  const handleUnblock = async (deviceId: string) => {
    setUnblocking(deviceId);
    setUnblockSuccess(null);
    setUnblockError(null);
    try {
      await unblock(deviceId);
      setUnblockSuccess(`Dispositivo ${deviceId} desbloqueado com sucesso.`);
      setTimeout(() => setUnblockSuccess(null), 4000);
    } catch {
      setUnblockError(`Erro ao desbloquear ${deviceId}. Tente novamente.`);
      setTimeout(() => setUnblockError(null), 5000);
    } finally {
      setUnblocking(null);
    }
  };

  return (
    <section className="dashboard-panel">
      <div className="panel-header-row">
        <div>
          <h2>Dispositivos bloqueados</h2>
          <p className="panel-subtitle">
            Dispositivos bloqueados automaticamente por anomalia.
          </p>
        </div>
        <span className="refresh-note">Atualiza a cada 15s</span>
      </div>

      {unblockSuccess && (
        <p className="success-text">{unblockSuccess}</p>
      )}
      {unblockError && (
        <p className="error-text">{unblockError}</p>
      )}

      {isLoading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p className="error-text">Erro: {error}</p>
      ) : devices.length === 0 ? (
        <p>Nenhum dispositivo bloqueado.</p>
      ) : (
        <ul className="audit-list">
          {devices.map((d) => (
            <li key={d.deviceId}>
              <div className="alert-row">
                <span className="alert-action">{d.deviceId}</span>
                <span className="event-badge blocked">Bloqueado</span>
              </div>
              <div className="alert-meta">
                <span>Motivo: {d.reason}</span>
                <span>Risk: {d.riskScore}</span>
                <span>
                  {new Date(d.blockedAt).toLocaleString("pt-BR", {
                    day: "2-digit", month: "2-digit",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
              <button
                className="btn-unblock"
                onClick={() => handleUnblock(d.deviceId)}
                disabled={unblocking === d.deviceId}
              >
                {unblocking === d.deviceId ? "Desbloqueando..." : "Desbloquear"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
