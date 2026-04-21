import { NavLink } from "react-router-dom";
import {
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  BellAlertIcon,
  ChartBarSquareIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SecurityPanel } from "./SecurityPanel";
import { useAuth } from "../hooks/useAuth";
import { useAuditEvents } from "../hooks/useAuditEvents";
import { useAuditIncidents } from "../hooks/useAuditIncidents";
import { useAuditSummary } from "../hooks/useAuditSummary";
import { useAuditTrends } from "../hooks/useAuditTrends";

const exportPDF = async () => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    const element = document.querySelector(".dashboard-export") as HTMLElement | null;

    if (!element) return;

    const canvas = await html2canvas(element, {
      backgroundColor: "#08111f",
      scale: 1,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", format: "a4" });
    const date = new Date().toISOString().split("T")[0];

    pdf.setFontSize(14);
    pdf.text("CyberSecure AR - Relatorio SOC", 14, 12);
    pdf.setFontSize(9);
    pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 18);
    pdf.addImage(imgData, "PNG", 10, 24, 277, 170);
    pdf.save(`SOC-Report-${date}.pdf`);
  } catch {
    window.alert("Erro ao gerar PDF.");
  }
};

const roleLabels: Record<string, string> = {
  Technician: "Técnico de Campo",
  Specialist: "Especialista",
  Manager: "Gestor SOC",
};

const riskStatus = (riskScore: number) => {
  if (riskScore >= 70) {
    return {
      tone: "danger",
      label: "Risco elevado",
      description: "Atenção imediata para sessões suspeitas e bloqueios recorrentes.",
    } as const;
  }

  if (riskScore >= 40) {
    return {
      tone: "warning",
      label: "Risco moderado",
      description: "Há sinais relevantes de desvio, mas com impacto controlado.",
    } as const;
  }

  return {
    tone: "safe",
    label: "Risco controlado",
    description: "Telemetria estável com baixo volume de ações bloqueadas.",
  } as const;
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { events, isLoading: eventsLoading, error: eventsError } = useAuditEvents();
  const { summary, isLoading: summaryLoading, error: summaryError } = useAuditSummary();
  const { trends, isLoading: trendsLoading, error: trendsError } = useAuditTrends();
  const {
    incidents,
    isLoading: incidentsLoading,
    error: incidentsError,
  } = useAuditIncidents();

  const isManager = user?.role === "Manager";
  const recentAlerts = events.filter((event) => !event.wasAllowed);
  const riskScore = summary?.riskScore ?? 0;
  const risk = riskStatus(riskScore);
  const topActions = summary?.topActions ?? [];
  const summaryErrorText = summaryError || trendsError;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <ShieldCheckIcon />
          </div>
          <div>
            <div className="eyebrow">CyberSecure AR</div>
            <h1>Centro de monitoramento operacional</h1>
          </div>
        </div>

        <nav className="primary-nav">
          <NavLink to="/assistant" className="nav-item">
            Assistente
          </NavLink>
          <NavLink to="/dashboard" className="nav-item">
            Dashboard
          </NavLink>
          {isManager && (
            <NavLink to="/admin" className="nav-item">
              Admin
            </NavLink>
          )}
          <NavLink to="/profile" className="nav-item">
            Perfil
          </NavLink>
        </nav>

        <div className="topbar-actions">
          <button className="ghost-button" onClick={exportPDF}>
            <ArrowDownTrayIcon />
            Exportar PDF
          </button>
          <button className="ghost-button" onClick={logout}>
            <ArrowRightOnRectangleIcon />
            Sair
          </button>
        </div>
      </header>

      <main className="page-content dashboard-export">
        <section className="hero-panel">
          <div className="hero-copy-block">
            <div className="section-tag">SOC Dashboard</div>
            <h2>
              Visão de risco para {user?.fullName ?? user?.username} ({roleLabels[user?.role ?? "Technician"]})
            </h2>
            <p>{risk.description}</p>
          </div>

          <div className="hero-stats">
            <article className={`stat-card ${risk.tone}`}>
              <SparklesIcon />
              <strong>{risk.label}</strong>
              <span>Risk score atual: {summaryLoading ? "..." : riskScore.toFixed(0)}</span>
            </article>
            <article className="stat-card">
              <BellAlertIcon />
              <strong>Alertas ativos</strong>
              <span>{eventsLoading ? "..." : recentAlerts.length} eventos bloqueados recentes.</span>
            </article>
            <article className="stat-card">
              <ChartBarSquareIcon />
              <strong>Incidentes correlacionados</strong>
              <span>{incidentsLoading ? "..." : incidents.length} grupos em observação.</span>
            </article>
          </div>
        </section>

        <section className="metric-grid">
          <article className={`metric-card ${risk.tone}`}>
            <span>Risk score</span>
            <strong>{summaryLoading ? "..." : riskScore.toFixed(0)}</strong>
            <small>Escala de 0 a 100 baseada em bloqueios e perfil.</small>
          </article>
          <article className="metric-card">
            <span>Eventos permitidos</span>
            <strong>{summaryLoading ? "..." : summary?.allowedEvents ?? 0}</strong>
            <small>Operações liberadas pela política.</small>
          </article>
          <article className="metric-card">
            <span>Eventos bloqueados</span>
            <strong>{summaryLoading ? "..." : summary?.blockedEvents ?? 0}</strong>
            <small>Tentativas retidas por regra de segurança.</small>
          </article>
          <article className="metric-card">
            <span>Eventos totais</span>
            <strong>{summaryLoading ? "..." : summary?.totalEvents ?? 0}</strong>
            <small>Base usada para tendência e correlação.</small>
          </article>
        </section>

        {summaryErrorText && <div className="error-box">{summaryErrorText}</div>}

        <section className="workspace-layout">
          <div className="workspace-main stack-grid">
            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Tendência</div>
                  <h3>Risco nos últimos 50 minutos</h3>
                </div>
              </div>

              {trendsLoading ? (
                <div className="empty-state">Carregando tendência...</div>
              ) : (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={trends}>
                      <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#102035",
                          border: "1px solid rgba(148, 163, 184, 0.15)",
                          borderRadius: "16px",
                          color: "#e5eefb",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="riskScore"
                        stroke="#29c7ac"
                        strokeWidth={3}
                        dot={{ fill: "#29c7ac", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Incidentes</div>
                  <h3>Fila de investigação</h3>
                </div>
              </div>

              {incidentsLoading ? (
                <div className="empty-state">Carregando incidentes...</div>
              ) : incidentsError ? (
                <div className="error-box">{incidentsError}</div>
              ) : incidents.length === 0 ? (
                <div className="empty-state">Nenhum incidente ativo no momento.</div>
              ) : (
                <ul className="audit-list">
                  {incidents.map((incident) => (
                    <li key={`${incident.correlationId}-${incident.lastOccurredAt}`}>
                      <div className="alert-row">
                        <span className="alert-action">{incident.resource}</span>
                        <span className={`status-pill ${incident.severity >= 70 ? "danger" : "warning"}`}>
                          Severidade {incident.severity}
                        </span>
                      </div>
                      <div className="alert-meta">
                        <span>Device {incident.deviceId}</span>
                        <span>
                          {incident.blockedEvents}/{incident.totalEvents} bloqueados
                        </span>
                        <span>
                          {new Date(incident.lastOccurredAt).toLocaleTimeString("pt-BR", {
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
          </div>

          <aside className="workspace-side stack-grid">
            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Ações</div>
                  <h3>Eventos mais frequentes</h3>
                </div>
              </div>

              {summaryLoading ? (
                <div className="empty-state">Carregando métricas...</div>
              ) : topActions.length === 0 ? (
                <div className="empty-state">Nenhuma ação registrada.</div>
              ) : (
                <ul className="metric-list">
                  {topActions.map((metric) => (
                    <li key={metric.action} className="list-surface">
                      <div className="metric-line">
                        <span>{metric.action}</span>
                        <strong>{metric.count}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Alertas</div>
                  <h3>Bloqueios recentes</h3>
                </div>
              </div>

              {eventsLoading ? (
                <div className="empty-state">Carregando eventos...</div>
              ) : eventsError ? (
                <div className="error-box">{eventsError}</div>
              ) : recentAlerts.length === 0 ? (
                <div className="empty-state">Nenhum bloqueio recente.</div>
              ) : (
                <ul className="audit-list">
                  {recentAlerts.slice(0, 5).map((event) => (
                    <li key={event.id}>
                      <div className="alert-row">
                        <span className="alert-action">{event.action}</span>
                        <span className="status-pill danger">Bloqueado</span>
                      </div>
                      <div className="alert-meta">
                        <span>{event.blockReason ?? "Ação suspeita"}</span>
                        <span>#{event.correlationId.slice(0, 8)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Recomendação</div>
                  <h3>Próxima ação sugerida</h3>
                </div>
              </div>

              <div className="recommendation-card">
                {risk.tone === "danger" ? <ShieldExclamationIcon /> : <ShieldCheckIcon />}
                <p>
                  {risk.tone === "danger"
                    ? "Priorize correlação por deviceId, revisão de tentativas bloqueadas e endurecimento do segundo fator para gestores."
                    : risk.tone === "warning"
                      ? "Revise sessões com tendência crescente e crie fila de triagem para operadores com repetição de erro."
                      : "Mantenha monitoramento contínuo, exportação periódica de auditoria e validação dos dispositivos confiáveis."}
                </p>
              </div>
            </section>
          </aside>
        </section>

        {isManager && <SecurityPanel />}
      </main>
    </div>
  );
};
