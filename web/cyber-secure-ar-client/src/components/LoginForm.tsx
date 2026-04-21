import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { LoginRequest } from "../types/auth";
import { BiometricModal } from "./BiometricModal";

const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || "AR-GLASSES-DEMO-001";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Preencha usuário e senha para continuar.");
      return;
    }
    setLoading(true);
    try {
      const payload: LoginRequest = {
        username: username.trim(),
        password: password.trim(),
        deviceId: DEVICE_ID,
      };
      await login(payload);
      setShowBiometric(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falha ao autenticar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showBiometric && (
        <BiometricModal
          onSuccess={() => navigate("/assistant")}
          onCancel={() => setShowBiometric(false)}
        />
      )}
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="ar-icon">🥽</div>
            <h1>CyberSecure AR</h1>
            <p>Entre no dashboard operacional SOC e acesse o assistente de campo.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Usuário</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                autoComplete="username"
                disabled={loading || showBiometric}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={loading || showBiometric}
              />
            </div>
            {error && <div className="error-box">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading || showBiometric}>
              {loading ? "Autenticando..." : "Entrar"}
            </button>
          </form>
          <div className="login-hint">
            <div className="hint-title">Dica de acesso</div>
            <p>Use um usuário válido e mantenha seu Device ID protegido.</p>
            <p style={{ marginTop: "0.75rem", color: "#cbd5e1", fontSize: "0.8rem" }}>
              Device ID ativo: <strong>{DEVICE_ID}</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
