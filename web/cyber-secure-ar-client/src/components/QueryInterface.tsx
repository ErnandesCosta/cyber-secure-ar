import { NavLink } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentMagnifyingGlassIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "../hooks/useQuery";

const suggestions = [
  "Quais procedimentos autorizados existem para válvula V-201?",
  "Mostre controles de acesso recomendados para manutenção em ambiente OT.",
  "Resumo de resposta a incidentes para dispositivo suspeito em campo.",
];

const roleLabels: Record<string, string> = {
  Technician: "Técnico de Campo",
  Specialist: "Especialista",
  Manager: "Gestor SOC",
};

export const QueryInterface = () => {
  const { user, logout } = useAuth();
  const { response, isLoading, error, sendQuery } = useQuery();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const question = String(formData.get("question") ?? "").trim();

    if (!question) return;

    await sendQuery(question);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <ShieldCheckIcon />
          </div>
          <div>
            <div className="eyebrow">CyberSecure AR</div>
            <h1>Assistente seguro para operações críticas</h1>
          </div>
        </div>

        <nav className="primary-nav">
          <NavLink to="/assistant" className="nav-item">
            Assistente
          </NavLink>
          <NavLink to="/dashboard" className="nav-item">
            Dashboard
          </NavLink>
          {user?.role === "Manager" && (
            <NavLink to="/admin" className="nav-item">
              Admin
            </NavLink>
          )}
          <NavLink to="/profile" className="nav-item">
            Perfil
          </NavLink>
        </nav>

        <div className="topbar-actions">
          <div className="user-pill">
            <span>{user?.fullName ?? user?.username}</span>
            <strong>{roleLabels[user?.role ?? "Technician"]}</strong>
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
            <div className="section-tag">Camada operacional</div>
            <h2>Consultas assistidas com política, contexto de dispositivo e trilha de auditoria.</h2>
            <p>
              Use o assistente para obter respostas operacionais dentro do seu perfil
              de acesso. Toda interação é registrada para análise de risco.
            </p>
          </div>

          <div className="hero-stats">
            <article className="stat-card">
              <SparklesIcon />
              <strong>IA filtrada</strong>
              <span>Respostas passam por proteção contra exposição indevida.</span>
            </article>
            <article className="stat-card">
              <DocumentMagnifyingGlassIcon />
              <strong>Escopo controlado</strong>
              <span>Somente documentos permitidos por papel e contexto.</span>
            </article>
            <article className="stat-card">
              <ChatBubbleLeftRightIcon />
              <strong>Registro contínuo</strong>
              <span>Consultas, bloqueios e anomalias alimentam o SOC.</span>
            </article>
          </div>
        </section>

        <section className="workspace-layout">
          <div className="workspace-main panel-surface">
            <div className="panel-heading">
              <div>
                <div className="section-tag">Consulta</div>
                <h3>Faça uma pergunta operacional</h3>
              </div>
            </div>

            <form className="query-form" onSubmit={handleSubmit}>
              <textarea
                className="query-input"
                name="question"
                rows={4}
                placeholder="Ex.: Quais controles devo validar antes de intervir em uma estação crítica?"
                disabled={isLoading}
              />
              <button type="submit" className="btn-primary btn-inline" disabled={isLoading}>
                <PaperAirplaneIcon />
                {isLoading ? "Consultando..." : "Enviar consulta"}
              </button>
            </form>

            <div className="suggestions">
              <span className="suggestions-label">Sugestões de consulta</span>
              <div className="suggestions-list">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => sendQuery(item)}
                    disabled={isLoading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="response-box">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Resposta</div>
                  <h3>Resultado do assistente</h3>
                </div>
                {response && (
                  <span className={`status-pill ${response.wasFiltered ? "warning" : "safe"}`}>
                    {response.wasFiltered ? "Conteúdo filtrado" : "Resposta liberada"}
                  </span>
                )}
              </div>

              {error && <div className="error-box">{error}</div>}

              {response ? (
                <>
                  <div className="response-content">
                    <p>{response.answer}</p>
                  </div>
                  <div className="response-meta">
                    <span>Nível de acesso: {response.accessLevel}</span>
                    <span>
                      Gerado em {" "}
                      {new Date(response.generatedAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  A resposta aparecerá aqui após uma consulta autorizada.
                </div>
              )}
            </div>
          </div>

          <aside className="workspace-side panel-surface">
            <div className="panel-heading">
              <div>
                <div className="section-tag">Boas práticas</div>
                <h3>Uso seguro do assistente</h3>
              </div>
            </div>

            <ul className="insight-list">
              <li>Faça perguntas específicas sobre manutenção, procedimento ou resposta a incidente.</li>
              <li>Evite solicitar segredos operacionais, credenciais ou dados fora do seu perfil.</li>
              <li>Use o dashboard para acompanhar incidentes, anomalias e dispositivos bloqueados.</li>
              <li>Para administradores, associe bloqueios com correlação de sessão e risco agregado.</li>
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
};
