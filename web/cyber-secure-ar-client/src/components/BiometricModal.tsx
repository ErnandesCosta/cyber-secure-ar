import { useState } from 'react';

type BiometricStatus = 'idle' | 'scanning' | 'approved' | 'denied';

interface BiometricModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricModal = ({ onSuccess, onCancel }: BiometricModalProps) => {
  const [status, setStatus] = useState<BiometricStatus>('idle');

  const startScan = () => {
    setStatus('scanning');
    setTimeout(() => {
      setStatus('approved');
      setTimeout(onSuccess, 800);
    }, 2200);
  };

  return (
    <div className="biometric-overlay">
      <div className="biometric-modal">
        <h2>Verificação Biométrica</h2>
        <p className="biometric-subtitle">Segunda camada de autenticação — CyberSecure AR</p>

        <div className={`fingerprint-icon ${status}`}>
          {status === 'idle' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#00f5ff" strokeWidth="2" width="80" height="80">
              <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8z"/>
              <path d="M32 16c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16z"/>
              <path d="M32 24c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/>
              <line x1="32" y1="32" x2="32" y2="32" strokeWidth="4"/>
            </svg>
          )}
          {status === 'scanning' && (
            <div className="scan-animation">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#00f5ff" strokeWidth="2" width="80" height="80">
                <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8z"/>
                <path d="M32 16c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16z"/>
                <path d="M32 24c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/>
              </svg>
              <div className="scan-line"></div>
            </div>
          )}
          {status === 'approved' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#00ff88" strokeWidth="3" width="80" height="80">
              <circle cx="32" cy="32" r="28" stroke="#00ff88" strokeWidth="2"/>
              <polyline points="20,32 28,40 44,24" stroke="#00ff88" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          )}
          {status === 'denied' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#ff4444" strokeWidth="3" width="80" height="80">
              <circle cx="32" cy="32" r="28" stroke="#ff4444" strokeWidth="2"/>
              <line x1="22" y1="22" x2="42" y2="42" stroke="#ff4444" strokeWidth="3" strokeLinecap="round"/>
              <line x1="42" y1="22" x2="22" y2="42" stroke="#ff4444" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          )}
        </div>

        {status === 'idle' && (
          <button className="btn-biometric" onClick={startScan}>
            Iniciar Verificação Biométrica
          </button>
        )}
        {status === 'scanning' && (
          <p className="scan-text">Escaneando impressão digital...</p>
        )}
        {status === 'approved' && (
          <p className="success-text">Identidade confirmada. Redirecionando...</p>
        )}
        {status === 'denied' && (
          <p className="error-text">Verificação falhou. Tente novamente.</p>
        )}

        {(status === 'idle' || status === 'denied') && (
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
        )}
      </div>
    </div>
  );
};
