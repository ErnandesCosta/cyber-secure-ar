import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuditEvents } from "../hooks/useAuditEvents";
import { useAuditSummary } from "../hooks/useAuditSummary";
import { useAuditTrends } from "../hooks/useAuditTrends";
import { useAuditIncidents } from "../hooks/useAuditIncidents";
import { SecurityPanel } from "./SecurityPanel";

const exportPDF = async () => {
  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const element = document.querySelector('.dashboard-content') as HTMLElement;
    if (!element) return;
    const canvas = await html2canvas(element, {
      backgroundColor: '#0d0d1a',
      scale: 1,
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', format: 'a4' });
    const date = new Date().toISOString().split('T')[0];
    pdf.setFontSize(14);
    pdf.text('CyberSecure AR - Relatório SOC', 14, 12);
    pdf.setFontSize(9);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 18);
    pdf.addImage(imgData, 'PNG', 10, 24, 277, 170);
    pdf.save(`SOC-Report-${date}.pdf`);
  } catch {
    alert('Erro ao gerar PDF. Verifique se jspdf e html2canvas estão instalados.');
  }
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { events, isLoading: eventsLoading, error: eventsError } = useAuditEvents();
  const { summary, isLoading: summaryLoading, error: summaryError } = useAuditSummary();
  const { trends, isLoading: trendsLoading } = useAuditTrends();
  const { incidents, isLoading: incidentsLoading, error: incidentsError } = useAuditIncidents();

  const isManager = user?.role === "Manager";
  const topActions = summary?.topActions ?? [];
  const recentAlerts = events?.filter((e) => !e.wasAllowed) ?? [];
  const alertCount = recentAlerts.length;
  const riskScore = summary?.riskScore ?? 0;
  const riskColor = riskScore >= 70 ? "danger" : riskScore >= 40 ? "warning" : "safe";

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <div className="app-logo">CyberSecure AR</div>
          <div className="app-subtitle">SOC Dashboard</div>
        </div>
        <nav className="dashboard-nav">
          <NavLink to="/assistant" className="nav-item">Assistente</NavLink>
          <NavLink to="/dashboard" className="nav-item">Dashboard</NavLink>
          <NavLink to="/profile" className="nav-item">Perfil</NavLink>
          <button className="nav-item btn-export-pdf" onClick={exportPDF} title="Exportar relatório PDF">
            📄 Exportar PDF
          </button>
          <button className="nav-item logout-button" onClick={logout}>Sair</button>
        </nav>
      </header>
      <main className="dashboard-content">
        {/* ── CARDS RESUMO ── */}
        <section className="dashboard-panel">
          <div className="panel-header-row">
            <div>
              <h2>Visão geral de segurança</h2>
              <p className="panel-subtitle">Métricas atualizadas automaticamente.</p>
            </div>
            <span className="live-badge">Tempo real</span>
          </div>
          <div className="dashboard-card-grid">
            <div className={`dashboard-card compact-card risk-${riskColor}`}>
              <h3>Risk Score</h3>
              <p className="card-value">{summaryLoading ? "..." : riskScore.toFixed(0)}</p>
              <p className="card-note">Score de 0 a 100</p>
            </div>
            <div className="dashboard-card compact-card">
              <h3>Bloqueios</h3>
              <p className="card-value">{summaryLoading ? "..." : summary?.blockedEvents ?? 0}</p>
              <p className="card-note">Eventos bloqueados</p>
            </div>
            <div className="dashboard-card compact-card">
              <h3>Alertas ativos</h3>
              <p className="card-value">{eventsLoading ? "..." : alertCount}</p>
              <p className="card-note">Requerem atenção</p>
            </div>
            <div className="dashboard-card compact-card">
              <h3>Incidentes</h3>
              <p className="card-value">{incidentsLoading ? "..." : incidents.length}</p>
              <p className="card-note">Grupos de eventos</p>
            </div>
          </div>
          {summaryError && <p className="error-text">Erro: {summaryError}</p>}
        </section>

        {/* ── TENDÊNCIA DE RISCO ── */}
        <section className="dashboard-panel">
          <h2>Tendência de risco (últimos 50 min)</h2>
          {trendsLoading ? (
            <p>Carregando tendências...</p>
          ) : (
            <div className="trend-chart">
              {trends.map((t, index) => (
                <div key={index} className="trend-bar-wrapper">
                  <div
                    className={`trend-bar ${t.riskScore >= 70 ? "danger" : t.riskScore >= 40 ? "warning" : "safe"}`}
                    style={{ height: `${Math.max(t.riskScore, 4)}%` }}
                    title={`${t.label}: ${t.riskScore}`}
                  />
                  <span className="trend-label">{t.label}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── INCIDENTES ATIVOS ── */}
        <section className="dashboard-panel">
          <h2>Incidentes ativos</h2>
          <p className="panel-subtitle">Grupos de eventos correlacionados por sessão.</p>
          {incidentsLoading ? (
            <p>Carregando incidentes...</p>
          ) : incidentsError ? (
            <p className="error-text">Erro: {incidentsError}</p>
          ) : incidents.length === 0 ? (
            <p>Nenhum incidente ativo.</p>
          ) : (
            <ul className="audit-list">
              {incidents.map((inc, index) => (
                <li key={index}>
                  <div className="alert-row">
                    <span className="alert-action">{inc.resource}</span>
                    <span className={`event-badge ${inc.severity >= 70 ? "blocked" : "warning"}`}>
                      Severidade {inc.severity}
                    </span>
                  </div>
                  <div className="alert-meta">
                    <span>Device: {inc.deviceId}</span>
                    <span>{inc.blockedEvents}/{inc.totalEvents} bloqueados</span>
                    <span>
                      {new Date(inc.lastOccurredAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── PRINCIPAIS AÇÕES (só Manager) ── */}
        {isManager && (
          <section className="dashboard-panel">
            <h2>Principais ações</h2>
            {summaryLoading ? (
              <p>Carregando métricas...</p>
            ) : (
              <ul className="metric-list">
                {topActions.length ? (
                  topActions.slice(0, 5).map((m, index) => (
                    <li key={index}>
                      <strong>{m.action}</strong>: {m.count}
                    </li>
                  ))
                ) : (
                  <li>Nenhuma ação registrada ainda.</li>
                )}
              </ul>
            )}
          </section>
        )}

        {/* ── ALERTAS RECENTES ── */}
        <section className="dashboard-panel">
          <div className="panel-header-row">
            <div>
              <h2>Alertas recentes</h2>
              <p className="panel-subtitle">Eventos bloqueados pela política de segurança.</p>
            </div>
            <span className="refresh-note">Atualizando a cada 10s</span>
          </div>
          {eventsLoading ? (
            <p>Carregando alertas...</p>
          ) : eventsError ? (
            <p className="error-text">Erro ao carregar alertas: {eventsError}</p>
          ) : recentAlerts.length ? (
            <ul className="audit-list compact-alert-list">
              {recentAlerts.slice(0, 5).map((event, index) => (
                <li key={index}>
                  <div className="alert-row">
                    <span className="alert-action">{event.action}</span>
                    <span className="event-badge blocked">Bloqueado</span>
                  </div>
                  <div className="alert-meta">
                    <span>
                      {new Date(event.occurredAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{event.blockReason ?? "Ação suspeita"}</span>
                    <span className="correlation-tag">#{event.correlationId?.slice(0, 8)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum alerta crítico identificado recentemente.</p>
          )}
        </section>

        {/* ── DISPOSITIVOS BLOQUEADOS (só Manager) ── */}
        {isManager && <SecurityPanel />}
      </main>
    </div>
  );
};
