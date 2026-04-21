import { useState } from "react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

export const QueryInterface = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/assistant/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Device-Id": "AR-GLASSES-DEMO-001",
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResponse(data.response || "Resposta recebida.");
    } catch (error) {
      setResponse("Erro ao consultar assistente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-container">
      <header className="assistant-header">
        <ChatBubbleLeftRightIcon className="icon" />
        <h1>Assistente de Seguranca IA</h1>
        <p>Faca perguntas sobre procedimentos de seguranca.</p>
      </header>

      <form onSubmit={handleSubmit} className="query-form">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Digite sua pergunta..."
          rows={3}
        />
        <button type="submit" disabled={loading}>
          <PaperAirplaneIcon className="icon" />
          {loading ? "Consultando..." : "Enviar"}
        </button>
      </form>

      {response && (
        <div className="response-box">
          <h3>Resposta:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};
