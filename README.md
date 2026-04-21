# CyberSecure AR

Plataforma de seguranca operacional com IA, passkeys e monitoramento SOC para cenarios com smart glasses e operacao critica.

## Visao geral

O projeto combina:

- autenticacao com JWT e contexto de dispositivo
- login com passkey/WebAuthn
- assistente de IA com restricao por perfil
- auditoria continua
- dashboard SOC
- area administrativa para gestores

## Stack

### Backend

- .NET 8
- ASP.NET Core
- JWT Bearer
- Fido2 (.NET WebAuthn)

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Recharts

## Rotas do frontend

| Rota | Objetivo | Perfil |
|---|---|---|
| `/` | Login | Publico |
| `/assistant` | Assistente operacional | Autenticado |
| `/dashboard` | Dashboard SOC | Autenticado |
| `/admin` | Monitoramento administrativo | Manager |
| `/profile` | Perfil, postura e passkeys | Autenticado |

## Endpoints principais

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Passkeys

- `GET /api/passkeys`
- `POST /api/passkeys/registration/options`
- `POST /api/passkeys/registration/verify`
- `POST /api/passkeys/authentication/options`
- `POST /api/passkeys/authentication/verify`
- `DELETE /api/passkeys/{credentialId}`

### Auditoria e seguranca

- `GET /api/audit/events`
- `GET /api/audit/summary`
- `GET /api/audit/trends`
- `GET /api/audit/incidents`
- `GET /api/security/blocked-devices`
- `DELETE /api/security/blocked-devices/{deviceId}`
- `GET /api/security/anomalies/{deviceId}`

## Como rodar

### Backend

```bash
cd src/CyberSecureAR.API
dotnet restore
dotnet run
```

### Frontend

```bash
cd web/cyber-secure-ar-client
npm install
npm run dev
```

## Variaveis principais

### Frontend

```text
VITE_API_URL=http://localhost:5000
VITE_DEVICE_ID=AR-GLASSES-DEMO-001
```

### Backend

Configure `TokenConfiguration`, `Cors` e `Passkeys` em `src/CyberSecureAR.API/appsettings.json`.

## Status atual

O projeto ja entrega um MVP tecnico forte:

- login tradicional
- login com passkey real
- gestao de passkeys no perfil
- dashboard SOC
- admin monitoring

Limitacoes atuais:

- persistencia simplificada em memoria em partes do sistema
- sem integracao OT real
- sem suite de testes valida ainda

Mais detalhes em [docs/product-status.md](docs/product-status.md).
