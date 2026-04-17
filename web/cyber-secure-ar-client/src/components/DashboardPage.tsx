import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuditEvents } from "../hooks/useAuditEvents";
import { useAuditSummary } from "../hooks/useAuditSummary";

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { events, isLoading: eventsLoading, error: eventsError } = useAuditEvents();
  const { summary, isLoading: summaryLoading, error: summaryError } = useAuditSummary();

  const isManager = user?.role === "Manager";
  const topActions = summary?.topActions ?? [];
  const recentAlerts = events?.filter((item) => !item.wasAllowed || item.action?.toLowerCase().includes("blocked")) ?? [];
  const alertCount = recentAlerts.length;

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <div className="app-logo">CyberSecureAR</div>
          <div className="app-subtitle">SOC Dashboard</div>
        </div>

        <nav className="dashboard-nav">
          <NavLink to="/assistant" className="nav-item">
            Assistente
          </NavLink>
          <NavLink to="/dashboard" className="nav-item">
            Dashboard
          </NavLink>
          <button className="nav-item logout-button" onClick={logout}>
            Sair
          </button>
        </nav>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-panel">
          <div className="panel-header-row">
            <div>
              <h2>Visão geral de segurança</h2>
              <p className="panel-subtitle">Informações enxutas para técnicos, com alertas atualizados automaticamente.</p>
            </div>
            <span className="live-badge">Atualizado em tempo real</span>
          </div>

          <div className="dashboard-card-grid">
            <div className="dashboard-card compact-card">
              <h3>Risk Score</h3>
              <p className="card-value">{summaryLoading ? "..." : summary ? summary.riskScore.toFixed(1) : "—"}</p>
              <p className="card-note">Visão rápida do risco atual.</p>
            </div>

            <div className="dashboard-card compact-card">
              <h3>Bloqueios</h3>
              <p className="card-value">{summaryLoading ? "..." : summary?.blockedEvents ?? 0}</p>
              <p className="card-note">Eventos bloqueados pela política.</p>
            </div>

            <div className="dashboard-card compact-card">
              <h3>Alertas ativos</h3>
              <p className="card-value">{eventsLoading ? "..." : alertCount}</p>
              <p className="card-note">Alertas críticos para análise imediata.</p>
            </div>
          </div>

          {summaryError && <p className="error-text">Erro ao carregar resumo: {summaryError}</p>}
        </section>

        {isManager && (
          <section className="dashboard-panel">
            <h2>Principais ações</h2>
            {summaryLoading ? (
              <p>Carregando métricas...</p>
            ) : (
              <ul className="metric-list">
                {topActions.length ? (
                  topActions.slice(0, 5).map((metric) => (
                    <li key={metric.action}>
                      <strong>{metric.action}</strong>: {metric.count}
                    </li>
                  ))
                ) : (
                  <li>Nenhuma ação registrada ainda.</li>
                )}
              </ul>
            )}
          </section>
        )}

        <section className="dashboard-panel">
          <div className="panel-header-row">
            <div>
              <h2>Alertas recentes</h2>
              <p className="panel-subtitle">Somente eventos mais relevantes para o time de campo.</p>
            </div>
            <span className="refresh-note">Atualizando a cada 10s</span>
          </div>

          {eventsLoading ? (
            <p>Carregando alertas...</p>
          ) : eventsError ? (
            <p className="error-text">Erro ao carregar alertas: {eventsError}</p>
          ) : recentAlerts.length ? (
            <ul className="audit-list compact-alert-list">
              {recentAlerts.slice(0, 4).map((event) => (
                <li key={event.id} className="audit-list-item compact-alert-item">
                  <div className="alert-row">
                    <span className="alert-action">{event.action}</span>
                    <span className={`event-badge ${event.wasAllowed ? "allowed" : "blocked"}`}>
                      {event.wasAllowed ? "Permitido" : "Bloqueado"}
                    </span>
                  </div>
                  <div className="alert-meta">
                    <span>{new Date(event.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {!event.wasAllowed && <span>{event.blockReason ?? "Ação suspeita"}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum alerta crítico identificado recentemente.</p>
          )}
        </section>
      </main>
    </div>
  );
};
