import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";

export const LoginForm = () => {
  const { login, isLoading, error } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
    deviceId: import.meta.env.VITE_DEVICE_ID as string || "AR-GLASSES-DEMO-001",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
    } catch {
      // erro tratado no context
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-header">
          <div className="ar-icon">🥽</div>
          <h1>CyberSecure AR</h1>
          <p>Acesso Corporativo Seguro via Smart Glasses</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              placeholder="tecnico.joao"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="deviceId">Device ID (Smart Glasses)</label>
            <input
              id="deviceId"
              type="text"
              value={form.deviceId}
              readOnly
              className="readonly"
            />
          </div>

          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner message="Autenticando..." />
          ) : (
            <button type="submit" className="btn-primary">
              Entrar com Identidade Corporativa
            </button>
          )}

        </form>

        <div className="login-hint">
          <p className="hint-title">Usuários de teste:</p>
          <p><strong>Técnico:</strong> tecnico.joao / Tecnico@123</p>
          <p><strong>Especialista:</strong> especialista.ana / Especialista@123</p>
          <p><strong>Gestor:</strong> gestor.carlos / Gestor@123</p>
        </div>

      </div>
    </div>
  );
};