# Deployment Guide

## Current Deployment Status

The project is ready for local execution and technical demonstration. It is not production-ready yet because persistence, secrets and infrastructure hardening are still simplified.

## Local Development

### Backend

```powershell
cd src\CyberSecureAR.API
dotnet restore
dotnet run
```

Expected URL:

```text
http://localhost:5000
```

### Frontend

```powershell
cd web\cyber-secure-ar-client
npm install
npm run dev
```

Expected URL:

```text
http://localhost:5173
```

## Environment Variables

### Frontend

File:

```text
web/cyber-secure-ar-client/.env
```

Values:

```text
VITE_API_URL=http://localhost:5000
VITE_DEVICE_ID=AR-GLASSES-DEMO-001
```

### Backend

Main config files:

```text
src/CyberSecureAR.API/appsettings.json
src/CyberSecureAR.API/appsettings.Development.json
```

Important sections:

- `TokenConfiguration`
- `Cors`
- `Passkeys`

## Build

### Backend

```powershell
dotnet build src\CyberSecureAR.API\CyberSecureAR.API.csproj
```

### Frontend

```powershell
cd web\cyber-secure-ar-client
npm run build
```

## Tests

```powershell
dotnet test tests\CyberSecureAR.Tests.csproj
```

## Common Windows Issue

If `dotnet run` fails because DLL files are being used by `CyberSecureAR.API`, stop the old process:

```powershell
.\scripts\Stop-CyberSecureBackend.ps1
```

Then run the backend again.

## Production Checklist

Before deploying to production:

- replace in-memory repositories with a real database
- store secrets outside `appsettings.json`
- enable HTTPS only
- configure strict CORS for the production domain
- configure a production WebAuthn relying party ID
- add structured logs and monitoring
- add rate limiting
- add database migrations
- add CI/CD checks
- expand automated tests
