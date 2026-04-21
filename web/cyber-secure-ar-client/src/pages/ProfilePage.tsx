import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const roleLabels: Record<string, string> = {
  Technician: 'Técnico de Campo',
  Specialist: 'Especialista de Segurança',
  Manager: 'Gestor SOC',
};

const roleColors: Record<string, string> = {
  Technician: '#00aaff',
  Specialist: '#ffaa00',
  Manager: '#00ff88',
};

const rolePermissions: Record<string, string[]> = {
  Technician: [
    'Consultar assistente IA',
    'Ver procedimentos do seu perfil',
    'Acesso de leitura a manuais autorizados',
    'Autenticação por dispositivo registrado',
  ],
  Specialist: [
    'Consultar assistente IA',
    'Ver todos os procedimentos técnicos',
    'Análise de anomalias por dispositivo',
    'Acesso ao histórico de eventos',
  ],
  Manager: [
    'Dashboard SOC completo em tempo real',
    'Desbloquear dispositivos suspeitos',
    'Exportar relatórios de auditoria',
    'Gerenciar e monitorar todos os perfis',
    'Visão do Risk Score global',
  ],
};

const roleRestrictions: Record<string, string[]> = {
  Technician: [
    'Não acessa dados de outros técnicos',
    'Não acessa painel SOC',
    'Não pode desbloquear dispositivos',
  ],
  Specialist: [
    'Não acessa painel SOC',
    'Não pode desbloquear dispositivos',
  ],
  Manager: [],
};

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role ?? 'Technician';
  const color = roleColors[role] ?? '#00f5ff';
  const initial = (user?.username?.[0] ?? 'U').toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1>Perfil do Usuário</h1>
      </div>

      <div className="profile-layout">
        {/* Card principal */}
        <div className="profile-card">
          <div className="profile-avatar" style={{ borderColor: color, color }}>
            {initial}
          </div>
          <h2 className="profile-username">{user?.username ?? 'Usuário'}</h2>
          <span className="profile-role-badge" style={{ background: color + '22', color, border: `1px solid ${color}` }}>
            {roleLabels[role] ?? role}
          </span>

          <div className="profile-device-card">
            <div className="profile-device-label">Device ID</div>
            <code className="profile-device-id">{user?.deviceId ?? 'AR-GLASSES-001'}</code>
            <div className="profile-device-status">
              <span className="status-dot"></span>
              Dispositivo registrado e ativo
            </div>
          </div>

          <div className="profile-meta">
            <div className="meta-item">
              <span className="meta-label">Autenticação</span>
              <span className="meta-value">JWT + Device ID</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">2º Fator</span>
              <span className="meta-value">Biométrico</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Sessão</span>
              <span className="meta-value">Ativa</span>
            </div>
          </div>
        </div>

        {/* Permissoes e restricoes */}
        <div className="profile-permissions-panel">
          <div className="permissions-section">
            <h3>✅ Permissões do Perfil</h3>
            <ul className="permissions-list">
              {(rolePermissions[role] ?? []).map((p) => (
                <li key={p} className="permission-item allowed">{p}</li>
              ))}
            </ul>
          </div>

          {(roleRestrictions[role] ?? []).length > 0 && (
            <div className="permissions-section">
              <h3>🚫 Restrições Ativas</h3>
              <ul className="permissions-list">
                {roleRestrictions[role].map((r) => (
                  <li key={r} className="permission-item denied">{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="permissions-section">
            <h3>🔒 Política de Segurança</h3>
            <ul className="permissions-list">
              <li className="permission-item info">Acesso negado gera alerta automático no SOC</li>
              <li className="permission-item info">Todos os eventos são auditados em tempo real</li>
              <li className="permission-item info">Dispositivo não registrado é bloqueado automaticamente</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn-logout-profile" onClick={() => { logout(); navigate('/'); }}>
          Sair da Conta
        </button>
      </div>
    </div>
  );
};
