import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuditEvents } from "../hooks/useAuditEvents";
import { useAuditSummary } from "../hooks/useAuditSummary";
import { useAuditTrends } from "../hooks/useAuditTrends";
import { useAuditIncidents } from "../hooks/useAuditIncidents";
import { ShieldCheckIcon, ArrowRightOnRectangleIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SecurityPanel } from "./SecurityPanel";

export const DashboardPage = () => {
  const { logout } = useAuth();
  const { events, isLoading: eventsLoading } = useAuditEvents();
  const { summary, isLoading: summaryLoading } = useAuditSummary();
  const { trends, isLoading: trendsLoading } = useAuditTrends();
  const { incidents, isLoading: incidentsLoading } = useAuditIncidents();

  const recentAlerts = events?.filter((e) => !e.wasAllowed) ?? [];
  const alertCount = recentAlerts.length;
  const riskScore = summary?.riskScore ?? 0;
  const riskColor = riskScore >= 70 ? "danger" : riskScore >= 40 ? "warning" : "safe";

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <div className="app-logo">
            <ShieldCheckIcon className="icon" />
            CyberSecure AR
          </div>
          <div className="app-subtitle">SOC Dashboard</div>
        </div>
        <nav className="dashboard-nav">
          <NavLink to="/assistant" className="nav-item">
            💬 Assistente
          </NavLink>
          <NavLink to="/dashboard" className="nav-item">
            📊 Dashboard
          </NavLink>
          <button className="nav-item logout-button" onClick={logout}>
            <ArrowRightOnRectangleIcon className="icon" />
            Sair
          </button>
        </nav>
      </header>

      <main className="dashboard-content">

        {/* ── CARDS RESUMO ── */}
        <section className="dashboard-panel">
          <div className="panel-header-row">
            <div>
              <h2>Visao geral de seguranca</h2>
              <p className="panel-subtitle">Metricas atualizadas em tempo real.</p>
            </div>
            <span className="live-badge">🔴 Tempo real</span>
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
              <p className="card-note">Requerem atencao</p>
            </div>
            <div className="dashboard-card compact-card">
              <h3>Incidentes</h3>
              <p className="card-value">{incidentsLoading ? "..." : incidents.length}</p>
              <p className="card-note">Grupos de eventos</p>
            </div>
          </div>
        </section>

        {/* ── TENDENCIA DE RISCO ── */}
        <section className="dashboard-panel">
          <h2><ChartBarIcon className="icon" />Tendencia de risco (ultimos 50 min)</h2>
          {trendsLoading ? (
            <p>Carregando tendencias...</p>
          ) : (
            <div className="trend-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" stroke="var(--color-text-secondary)" />
                  <YAxis stroke="var(--color-text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-bg-secondary)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "10px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="riskScore"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* ── PAINEL DE SEGURANCA ── */}
        <SecurityPanel />

      </main>
    </div>
  );
};
