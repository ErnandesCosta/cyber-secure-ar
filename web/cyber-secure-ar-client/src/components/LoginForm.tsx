import { useState, type FormEvent } from "react";
import {
  ArrowRightCircleIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BiometricModal } from "./BiometricModal";
import type { LoginRequest } from "../types/auth";

const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || "AR-GLASSES-DEMO-001";

const trustHighlights = [
  {
    icon: ShieldCheckIcon,
    title: "Acesso contextual",
    description: "JWT, perfil de acesso e device trust aplicados na mesma jornada.",
  },
  {
    icon: FingerPrintIcon,
    title: "Segundo fator pronto",
    description: "Base preparada para WebAuthn e autenticação biométrica do dispositivo.",
  },
  {
    icon: CpuChipIcon,
    title: "Monitoramento SOC",
    description: "Eventos, incidentes e bloqueios correlacionados em uma única visão.",
  },
];

export function LoginForm() {
  const { login, loginWithPasskey } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
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

  const handlePasskeyLogin = async () => {
    setError(null);

    if (!username.trim()) {
      setError("Informe o usuário para autenticar com passkey.");
      return;
    }

    setPasskeyLoading(true);
    try {
      await loginWithPasskey({ username: username.trim() });
      navigate("/assistant");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falha ao autenticar com passkey.";
      setError(message);
    } finally {
      setPasskeyLoading(false);
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

      <div className="login-shell">
        <section className="login-hero">
          <div className="eyebrow">CyberSecure AR</div>
          <h1>
            Segurança operacional para ambiente industrial, assistente IA e visão
            SOC em tempo real.
          </h1>
          <p className="hero-copy">
            Plataforma para smart glasses e operações críticas com autenticação
            forte, proteção por dispositivo e monitoramento contínuo.
          </p>

          <div className="highlight-grid">
            {trustHighlights.map(({ icon: Icon, title, description }) => (
              <article key={title} className="highlight-card">
                <div className="highlight-icon">
                  <Icon />
                </div>
                <div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="login-panel">
          <div className="login-card">
            <div className="login-badge">
              <ShieldCheckIcon />
              Controle de acesso seguro
            </div>

            <div className="login-header">
              <div className="login-mark">
                <LockClosedIcon />
              </div>
              <div>
                <h2>Acessar operação</h2>
                <p>Entre com sua credencial para abrir assistente, auditoria e monitoramento.</p>
              </div>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Usuário</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tecnico.joao"
                  autoComplete="username webauthn"
                  disabled={loading || passkeyLoading || showBiometric}
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
                  disabled={loading || passkeyLoading || showBiometric}
                />
              </div>

              {error && (
                <div className="error-box">
                  <ExclamationTriangleIcon />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || passkeyLoading || showBiometric}
              >
                {loading ? "Autenticando..." : "Entrar na plataforma"}
              </button>

              <button
                type="button"
                className="ghost-button passkey-button"
                onClick={handlePasskeyLogin}
                disabled={loading || passkeyLoading || showBiometric}
              >
                <ArrowRightCircleIcon />
                {passkeyLoading ? "Validando passkey..." : "Entrar com passkey"}
              </button>
            </form>

            <div className="login-hint">
              <div className="hint-title">Postura de acesso</div>
              <div className="hint-row">
                <span>Device ativo</span>
                <strong>{DEVICE_ID}</strong>
              </div>
              <div className="hint-row">
                <span>2º fator</span>
                <strong>Fluxo biométrico / WebAuthn</strong>
              </div>
              <div className="hint-row">
                <span>Perfis</span>
                <strong>Técnico, Especialista e Gestor</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
