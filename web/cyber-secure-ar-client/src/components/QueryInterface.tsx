import { useState, type FormEvent } from "react";
import { useQuery } from "../hooks/useQuery";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";

const SUGGESTED_QUESTIONS = [
  "Qual é o procedimento de inspeção de válvulas?",
  "Quais são as regras de segurança em campo?",
  "Como fazer o checklist diário de operação?",
  "Mostre o relatório de manutenção preditiva.",
  "Quais são os planos estratégicos da empresa?",
];

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

export const QueryInterface = () => {
  const { user, logout } = useAuth();
  const { response, isLoading, error, sendQuery, reset } = useQuery();
  const [question, setQuestion] = useState("");

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
      {/* Header */}
      <header className="assistant-header">
        <div className="header-left">
          <span className="ar-icon-small">🥽</span>
          <span className="header-title">CyberSecure AR</span>
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
        {/* Sugestões */}
        <div className="suggestions">
          <p className="suggestions-label">Perguntas sugeridas:</p>
          <div className="suggestions-list">
            {SUGGESTED_QUESTIONS.map((q) => (
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

        {/* Área de resposta */}
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
                  🛡️ Resposta filtrada — dados sensíveis foram removidos
                  automaticamente.
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
                  Gerado em:{" "}
                  {new Date(response.generatedAt).toLocaleTimeString("pt-BR")}
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

        {/* Input de pergunta */}
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
      </main>
    </div>
  );
};
