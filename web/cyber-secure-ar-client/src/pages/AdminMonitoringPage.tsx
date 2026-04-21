import { NavLink } from "react-router-dom";
import {
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  CommandLineIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ServerStackIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import { useAuditEvents } from "../hooks/useAuditEvents";
import { useAuditIncidents } from "../hooks/useAuditIncidents";
import { useAuditSummary } from "../hooks/useAuditSummary";
import { useBlockedDevices } from "../hooks/useBlockedDevices";

const formatTime = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export const AdminMonitoringPage = () => {
  const { user, logout } = useAuth();
  const { events, isLoading: eventsLoading, error: eventsError } = useAuditEvents();
  const { incidents, isLoading: incidentsLoading, error: incidentsError } = useAuditIncidents();
  const { summary, isLoading: summaryLoading, error: summaryError } = useAuditSummary();
  const { devices, isLoading: devicesLoading, error: devicesError } = useBlockedDevices();

  const blockedEvents = events.filter((event) => !event.wasAllowed);
  const activeUsers = new Set(events.map((event) => event.userId).filter(Boolean)).size;
  const affectedDevices = new Set(blockedEvents.map((event) => event.deviceId)).size;
  const riskiestIncident = incidents[0];
  const highSeverityIncidents = incidents.filter((incident) => incident.severity >= 70);
  const topBlockedResources = blockedEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.resource] = (acc[event.resource] ?? 0) + 1;
    return acc;
  }, {});
  const playbookTargets = Object.entries(topBlockedResources)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 4);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <ShieldCheckIcon />
          </div>
          <div>
            <div className="eyebrow">CyberSecure AR</div>
            <h1>Admin Monitoring</h1>
          </div>
        </div>

        <nav className="primary-nav">
          <NavLink to="/assistant" className="nav-item">
            Assistente
          </NavLink>
          <NavLink to="/dashboard" className="nav-item">
            Dashboard
          </NavLink>
          <NavLink to="/admin" className="nav-item">
            Admin
          </NavLink>
          <NavLink to="/profile" className="nav-item">
            Perfil
          </NavLink>
        </nav>

        <div className="topbar-actions">
          <div className="user-pill">
            <span>{user?.fullName ?? user?.username}</span>
            <strong>Gestor SOC</strong>
          </div>
          <button className="ghost-button" onClick={logout}>
            <ArrowRightOnRectangleIcon />
            Sair
          </button>
        </div>
      </header>

      <main className="page-content">
        <section className="hero-panel">
          <div className="hero-copy-block">
            <div className="section-tag">Manager Console</div>
            <h2>Monitoramento contínuo, triagem operacional e resposta rápida para ativos críticos.</h2>
            <p>
              Esta área consolida eventos, dispositivos, incidentes e sinais de abuso
              para permitir decisão rápida de contenção e investigação.
            </p>
          </div>

          <div className="hero-stats">
            <article className="stat-card danger">
              <ExclamationTriangleIcon />
              <strong>Incidentes de alta severidade</strong>
              <span>{incidentsLoading ? "..." : highSeverityIncidents.length}</span>
            </article>
            <article className="stat-card warning">
              <ServerStackIcon />
              <strong>Dispositivos afetados</strong>
              <span>{eventsLoading ? "..." : affectedDevices}</span>
            </article>
            <article className="stat-card safe">
              <EyeIcon />
              <strong>Usuários monitorados</strong>
              <span>{eventsLoading ? "..." : activeUsers}</span>
            </article>
          </div>
        </section>

        <section className="metric-grid">
          <article className="metric-card">
            <span>Risk score global</span>
            <strong>{summaryLoading ? "..." : summary?.riskScore ?? 0}</strong>
            <small>Indicador consolidado para o operador SOC.</small>
          </article>
          <article className="metric-card danger">
            <span>Bloqueios recentes</span>
            <strong>{eventsLoading ? "..." : blockedEvents.length}</strong>
            <small>Eventos negados pelas políticas de acesso.</small>
          </article>
          <article className="metric-card warning">
            <span>Dispositivos bloqueados</span>
            <strong>{devicesLoading ? "..." : devices.length}</strong>
            <small>Ativos em contenção por anomalia ou risco.</small>
          </article>
          <article className="metric-card safe">
            <span>Eventos totais</span>
            <strong>{summaryLoading ? "..." : summary?.totalEvents ?? 0}</strong>
            <small>Telemetria disponível para investigação e auditoria.</small>
          </article>
        </section>

        <section className="workspace-layout">
          <div className="workspace-main stack-grid">
            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Triagem</div>
                  <h3>Incidente prioritário</h3>
                </div>
                <span className="status-pill warning">Atenção imediata</span>
              </div>

              {incidentsLoading ? (
                <div className="empty-state">Carregando incidente prioritário...</div>
              ) : incidentsError ? (
                <div className="error-box">{incidentsError}</div>
              ) : !riskiestIncident ? (
                <div className="empty-state">Nenhum incidente aberto no momento.</div>
              ) : (
                <div className="recommendation-card">
                  <CommandLineIcon />
                  <div className="stack-grid">
                    <p>
                      Priorize a correlação <strong>{riskiestIncident.correlationId}</strong> com foco no recurso{" "}
                      <strong>{riskiestIncident.resource}</strong> e no dispositivo{" "}
                      <strong>{riskiestIncident.deviceId}</strong>.
                    </p>
                    <div className="alert-meta">
                      <span>Severidade {riskiestIncident.severity}</span>
                      <span>
                        {riskiestIncident.blockedEvents}/{riskiestIncident.totalEvents} bloqueados
                      </span>
                      <span>Última ocorrência {formatTime(riskiestIncident.lastOccurredAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Playbooks</div>
                  <h3>Onde endurecer a política</h3>
                </div>
              </div>

              {eventsError ? (
                <div className="error-box">{eventsError}</div>
              ) : playbookTargets.length === 0 ? (
                <div className="empty-state">Ainda não há dados suficientes para recomendar playbooks.</div>
              ) : (
                <ul className="metric-list">
                  {playbookTargets.map(([resource, count]) => (
                    <li key={resource}>
                      <div className="metric-line">
                        <span>{resource}</span>
                        <strong>{count} bloqueios</strong>
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
                  <div className="section-tag">Cobertura</div>
                  <h3>Saúde da telemetria</h3>
                </div>
              </div>

              <ul className="insight-list">
                <li>
                  <ArrowPathIcon />
                  <span>Monitore `deviceId`, IP, correlação e usuário em cada ação sensível.</span>
                </li>
                <li>
                  <ArrowPathIcon />
                  <span>Acione step-up auth quando risco ou anomalia crescerem.</span>
                </li>
                <li>
                  <ArrowPathIcon />
                  <span>Associe recursos bloqueados a playbooks de contenção e revisão.</span>
                </li>
              </ul>
            </section>

            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Estado</div>
                  <h3>Status dos serviços</h3>
                </div>
              </div>

              <ul className="metric-list">
                <li>
                  <div className="metric-line">
                    <span>Auditoria</span>
                    <strong>{eventsError ? "Com falha" : "Operacional"}</strong>
                  </div>
                </li>
                <li>
                  <div className="metric-line">
                    <span>Resumo SOC</span>
                    <strong>{summaryError ? "Com falha" : "Operacional"}</strong>
                  </div>
                </li>
                <li>
                  <div className="metric-line">
                    <span>Gestão de dispositivos</span>
                    <strong>{devicesError ? "Com falha" : "Operacional"}</strong>
                  </div>
                </li>
              </ul>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
};
