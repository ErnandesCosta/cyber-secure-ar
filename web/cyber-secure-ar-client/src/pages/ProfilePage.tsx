import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  CheckBadgeIcon,
  CpuChipIcon,
  FingerPrintIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/apiService";
import type { PasskeyCredentialDto } from "../types/passkey";

const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || "AR-GLASSES-DEMO-001";

const roleLabels: Record<string, string> = {
  Technician: "Técnico de Campo",
  Specialist: "Especialista de Segurança",
  Manager: "Gestor SOC",
};

const rolePermissions: Record<string, string[]> = {
  Technician: [
    "Consultar assistente IA com escopo controlado.",
    "Visualizar procedimentos e instruções autorizadas.",
    "Operar com autenticação por dispositivo registrado.",
  ],
  Specialist: [
    "Consultar procedimentos avançados e contexto de segurança.",
    "Acompanhar eventos e incidentes do próprio escopo.",
    "Analisar comportamento anômalo por dispositivo.",
  ],
  Manager: [
    "Acessar dashboard SOC completo em tempo real.",
    "Visualizar incidentes, tendências e ações correlacionadas.",
    "Desbloquear dispositivos e exportar relatório operacional.",
  ],
};

const roleRestrictions: Record<string, string[]> = {
  Technician: [
    "Não acessa dispositivos bloqueados globais.",
    "Não administra políticas nem bloqueios de terceiros.",
  ],
  Specialist: [
    "Não executa desbloqueios administrativos.",
    "Não recebe visão global completa de todos os ativos.",
  ],
  Manager: [],
};

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passkeys, setPasskeys] = useState<PasskeyCredentialDto[]>([]);
  const [passkeyLoading, setPasskeyLoading] = useState(true);
  const [passkeyAction, setPasskeyAction] = useState<string | null>(null);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);

  const role = user?.role ?? "Technician";
  const initial = (user?.fullName ?? user?.username ?? "U").charAt(0).toUpperCase();

  const loadPasskeys = async () => {
    try {
      const data = await apiService.getPasskeys();
      setPasskeys(data);
      setPasskeyError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar passkeys.";
      setPasskeyError(message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  useEffect(() => {
    void loadPasskeys();
  }, []);

  const handleRegisterPasskey = async () => {
    setPasskeyAction("register");
    setPasskeyError(null);
    setPasskeySuccess(null);

    try {
      const label = `Passkey ${new Date().toLocaleDateString("pt-BR")}`;
      const options = await apiService.beginPasskeyRegistration({ label });
      const { startRegistration, platformAuthenticatorIsAvailable } = await import("@simplewebauthn/browser");

      if (!(await platformAuthenticatorIsAvailable())) {
        throw new Error("Nenhum autenticador de plataforma disponível neste dispositivo.");
      }

      const response = await startRegistration({ optionsJSON: options });
      await apiService.finishPasskeyRegistration(response);
      await loadPasskeys();
      setPasskeySuccess("Passkey registrada com sucesso.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falha ao registrar passkey.";
      setPasskeyError(message);
    } finally {
      setPasskeyAction(null);
    }
  };

  const handleDeletePasskey = async (credentialId: string) => {
    setPasskeyAction(credentialId);
    setPasskeyError(null);
    setPasskeySuccess(null);

    try {
      await apiService.deletePasskey(credentialId);
      await loadPasskeys();
      setPasskeySuccess("Passkey removida.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falha ao remover passkey.";
      setPasskeyError(message);
    } finally {
      setPasskeyAction(null);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <IdentificationIcon />
          </div>
          <div>
            <div className="eyebrow">CyberSecure AR</div>
            <h1>Perfil e postura de acesso</h1>
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
          <button className="ghost-button" onClick={() => navigate(-1)}>
            <ArrowLeftIcon />
            Voltar
          </button>
          <button
            className="ghost-button"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <ArrowRightOnRectangleIcon />
            Sair
          </button>
        </div>
      </header>

      <main className="page-content">
        <section className="workspace-layout profile-layout">
          <article className="panel-surface profile-card">
            <div className="profile-avatar">{initial}</div>
            <h2>{user?.fullName ?? "Usuário"}</h2>
            <p className="profile-username">@{user?.username ?? "usuario"}</p>
            <span className="status-pill safe">{roleLabels[role]}</span>

            <div className="profile-info-grid">
              <div className="profile-info-row">
                <span>Departamento</span>
                <strong>{user?.department ?? "Operações"}</strong>
              </div>
              <div className="profile-info-row">
                <span>Device ID</span>
                <strong>{DEVICE_ID}</strong>
              </div>
              <div className="profile-info-row">
                <span>Autenticação</span>
                <strong>JWT + Device Trust</strong>
              </div>
              <div className="profile-info-row">
                <span>Segundo fator</span>
                <strong>WebAuthn / biometria</strong>
              </div>
            </div>
          </article>

          <div className="stack-grid">
            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Permissões</div>
                  <h3>O que este perfil pode fazer</h3>
                </div>
              </div>

              <ul className="insight-list">
                {rolePermissions[role].map((permission) => (
                  <li key={permission}>
                    <CheckBadgeIcon />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </section>

            {roleRestrictions[role].length > 0 && (
              <section className="panel-surface">
                <div className="panel-heading">
                  <div>
                    <div className="section-tag">Restrições</div>
                    <h3>Limites ativos do papel</h3>
                  </div>
                </div>

                <ul className="insight-list danger-list">
                  {roleRestrictions[role].map((restriction) => (
                    <li key={restriction}>
                      <ShieldCheckIcon />
                      <span>{restriction}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Passkeys</div>
                  <h3>Biometria e autenticadores</h3>
                </div>
              </div>

              {passkeyError && <div className="error-box">{passkeyError}</div>}
              {passkeySuccess && <div className="success-box">{passkeySuccess}</div>}

              <div className="recommendation-card">
                <FingerPrintIcon />
                <p>
                  Cadastre uma passkey real para habilitar autenticação WebAuthn com
                  verificação local no dispositivo.
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={handleRegisterPasskey}
                disabled={passkeyAction !== null}
              >
                {passkeyAction === "register" ? "Registrando passkey..." : "Cadastrar passkey"}
              </button>

              {passkeyLoading ? (
                <div className="empty-state">Carregando passkeys...</div>
              ) : passkeys.length === 0 ? (
                <div className="empty-state">Nenhuma passkey cadastrada para este usuário.</div>
              ) : (
                <ul className="metric-list">
                  {passkeys.map((passkey) => (
                    <li key={passkey.credentialId}>
                      <div className="metric-line">
                        <span>{passkey.label}</span>
                        <strong>{passkey.isBackedUp ? "Sincronizada" : "Local"}</strong>
                      </div>
                      <div className="alert-meta">
                        <span>Counter {passkey.signatureCounter}</span>
                        <span>Criada em {new Date(passkey.createdAt).toLocaleDateString("pt-BR")}</span>
                        <span>
                          Último uso {passkey.lastUsedAt ? new Date(passkey.lastUsedAt).toLocaleString("pt-BR") : "ainda não utilizado"}
                        </span>
                      </div>
                      <button
                        className="ghost-button"
                        onClick={() => handleDeletePasskey(passkey.credentialId)}
                        disabled={passkeyAction !== null}
                      >
                        <TrashIcon />
                        {passkeyAction === passkey.credentialId ? "Removendo..." : "Remover"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel-surface">
              <div className="panel-heading">
                <div>
                  <div className="section-tag">Postura</div>
                  <h3>Reforços sugeridos</h3>
                </div>
              </div>

              <div className="recommendation-grid">
                <article className="mini-card">
                  <CpuChipIcon />
                  <div>
                    <strong>Trust por dispositivo</strong>
                    <p>Vincule o deviceId a attestation ou inventário de ativo confiável.</p>
                  </div>
                </article>
                <article className="mini-card">
                  <ShieldCheckIcon />
                  <div>
                    <strong>Autenticação adaptativa</strong>
                    <p>Eleve o nível de verificação quando houver anomalia, risco ou troca de contexto.</p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};
