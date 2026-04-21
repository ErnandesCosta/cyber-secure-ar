import { useBlockedDevices } from "../hooks/useBlockedDevices";
import { AlertCircle, Lock, Unlock } from "lucide-react";

export const SecurityPanel = () => {
  const { devices, isLoading, error, unblock } = useBlockedDevices();

  return (
    <section className="dashboard-panel">
      <div className="panel-header-row">
        <div>
          <h2><Lock size={24} style={{ display: 'inline-block', marginRight: '0.5rem' }} />Dispositivos bloqueados</h2>
          <p className="panel-subtitle">
            Dispositivos bloqueados automaticamente por anomalia.
          </p>
        </div>
        <span className="refresh-note">Atualiza a cada 15s</span>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p className="error-text"><AlertCircle size={18} />Erro: {error}</p>
      ) : devices.length === 0 ? (
        <p>Nenhum dispositivo bloqueado.</p>
      ) : (
        <ul className="audit-list">
          {devices.map((d) => (
            <li key={d.deviceId}>
              <div className="alert-row">
                <span className="alert-action"><Lock size={18} />{d.deviceId}</span>
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
                onClick={() => unblock(d.deviceId)}
              >
                <Unlock size={16} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                Desbloquear
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};