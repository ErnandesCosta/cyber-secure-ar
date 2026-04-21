import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  CheckBadgeIcon,
  CpuChipIcon,
  IdentificationIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

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

  const role = user?.role ?? "Technician";
  const initial = (user?.fullName ?? user?.username ?? "U").charAt(0).toUpperCase();

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
