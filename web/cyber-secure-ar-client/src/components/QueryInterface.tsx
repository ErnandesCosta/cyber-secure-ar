import { useMemo, useState, type FormEvent } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "../hooks/useQuery";
import { useAuditEvents } from "../hooks/useAuditEvents";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";

const SUGGESTED_QUESTIONS = {
  Technician: [
    "Qual é o procedimento de inspeção de válvulas?",
    "Quais são as regras de segurança em campo?",
    "Como fazer o checklist diário de operação?",
  ],
  Specialist: [
    "Mostre o relatório de manutenção preditiva.",
    "Qual é o passo a passo para calibração de sensores?",
    "Como diagnosticar anomalias no painel?",
  ],
  Manager: [
    "Quais são os planos estratégicos da empresa?",
    "Resumo do status de conformidade de segurança.",
    "Detalhes das regras de auditoria operacional.",
  ],
  default: [
    "Qual é o procedimento de inspeção de válvulas?",
    "Quais são as regras de segurança em campo?",
    "Como fazer o checklist diário de operação?",
  ],
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "Manager":
      return "#ef4444";
    case "Specialist":
      return "#f59e0b";
    default:
      return "#3b82f6";
  }
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

export const QueryInterface = () => {
  const { user, logout } = useAuth();
  const { response, isLoading, error, sendQuery, reset } = useQuery();
  const { events, isLoading: isLoadingEvents, error: auditError } = useAuditEvents();
  const [question, setQuestion] = useState("");

  const suggestions = user
    ? SUGGESTED_QUESTIONS[user.role as keyof typeof SUGGESTED_QUESTIONS] ??
      SUGGESTED_QUESTIONS.default
    : SUGGESTED_QUESTIONS.default;

  const totalEvents = events.length;
  const blockedEvents = events.filter((event) => !event.wasAllowed).length;
  const allowedEvents = totalEvents - blockedEvents;

  const recentEvents = useMemo(
    () => events.slice(0, 4),
    [events]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    await sendQuery(question.trim());
  };

  const handleSuggestion = (q: string) => {
    setQuestion(q);
    reset();
  };

  return (
    <div className="assistant-container">
      <header className="assistant-header">
        <div className="header-left">
          <span className="ar-icon-small">🥽</span>
          <div>
            <h1>CyberSecure AR</h1>
            <p>Dashboard SOC para operações de campo e visibilidade de riscos.</p>
          </div>
        </div>

        <div className="assistant-nav">
          <NavLink to="/assistant" className="nav-item">
            Visão Geral
          </NavLink>
          <NavLink to="/dashboard" className="nav-item">
            SOC
          </NavLink>
        </div>

        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user?.fullName}</span>
            <span
              className="role-badge"
              style={{ backgroundColor: getRoleBadgeColor(user?.role || "") }}
            >
              {user?.role}
            </span>
            <span className="department">{user?.department}</span>
          </div>
          <button onClick={logout} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      <main className="assistant-main">
        <section className="dashboard-grid">
          <article className="dashboard-card">
            <p className="card-label">Status do Smart Glass</p>
            <h2>{user?.role || "Operador"}</h2>
            <p>Dispositivo: <strong>{import.meta.env.VITE_DEVICE_ID || "AR-GLASSES-DEMO-001"}</strong></p>
            <p>Trust: <strong>Verificado</strong></p>
          </article>

          <article className="dashboard-card">
            <p className="card-label">Eventos SOC</p>
            <h2>{totalEvents}</h2>
            <p>{allowedEvents} autorizados</p>
            <p>{blockedEvents} bloqueados</p>
          </article>

          <article className="dashboard-card">
            <p className="card-label">Conformidade</p>
            <h2>Segurança Ativa</h2>
            <p>IA responde apenas com dados autorizados.</p>
            <p>Auditoria em tempo real e controle de acesso.</p>
          </article>
        </section>

        <section className="workspace-grid">
          <div className="assistant-panel">
            <div className="panel-title">Assistente de Segurança</div>
            <div className="suggestions">
              <p className="suggestions-label">Perguntas recomendadas</p>
              <div className="suggestions-list">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    className="suggestion-chip"
                    onClick={() => handleSuggestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="assistant-note">
              🔐 A IA trabalha com documentos autorizados e aplica filtro de dados sensíveis.
            </div>

            <div className="response-area">
              {isLoading && (
                <LoadingSpinner message="Consultando com segurança..." />
              )}

              {error && !isLoading && (
                <div className="error-box">
                  🚫 <strong>Bloqueado pela política de segurança:</strong> {error}
                </div>
              )}

              {response && !isLoading && (
                <div className="response-box">
                  {response.wasFiltered && (
                    <div className="filter-warning">
                      🛡️ Resposta filtrada — dados sensíveis foram removidos automaticamente.
                    </div>
                  )}
                  <div className="response-content">
                    <pre>{response.answer}</pre>
                  </div>
                  <div className="response-meta">
                    <span>
                      Nível de acesso: <strong>{response.accessLevel}</strong>
                    </span>
                    <span>
                      Gerado em: {formatDateTime(response.generatedAt)}
                    </span>
                  </div>
                </div>
              )}

              {!isLoading && !error && !response && (
                <div className="empty-state">
                  🔒 Sessão segura iniciada. Faça sua pergunta abaixo.
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="query-form">
              <input
                type="text"
                placeholder="Ex: Qual é o procedimento de inspeção de válvulas?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isLoading}
                className="query-input"
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="btn-send"
              >
                {isLoading ? "..." : "Enviar"}
              </button>
            </form>
          </div>

          <aside className="soc-panel">
            <div className="panel-title">Feed SOC</div>
            <p className="panel-description">
              Monitoramento de eventos em tempo real para seu perfil.
            </p>

            {isLoadingEvents ? (
              <LoadingSpinner message="Carregando eventos SOC..." />
            ) : auditError ? (
              <div className="error-box">Falha ao carregar eventos: {auditError}</div>
            ) : (
              <div className="soc-feed">
                {recentEvents.length === 0 ? (
                  <div className="empty-state">
                    Nenhum evento registrado ainda.
                  </div>
                ) : (
                  recentEvents.map((event) => (
                    <div key={event.id} className="soc-event">
                      <div className="event-header">
                        <span className="event-action">{event.action}</span>
                        <span className={`event-badge ${event.wasAllowed ? "allowed" : "blocked"}`}>
                          {event.wasAllowed ? "Permitido" : "Bloqueado"}
                        </span>
                      </div>
                      <div className="event-resource">{event.resource}</div>
                      <div className="event-meta">
                        <span>{formatDateTime(event.occurredAt)}</span>
                        <span>{event.deviceId}</span>
                      </div>
                      {event.blockReason && (
                        <div className="event-reason">Razão: {event.blockReason}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
};
