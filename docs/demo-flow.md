# Demo Flow

## Goal

This demo flow shows how to present the project and explain the main security features.

## 1. Start the Backend

```powershell
cd src\CyberSecureAR.API
dotnet run
```

Expected URL:

```text
http://localhost:5000
```

If files are locked, stop the old API process:

```powershell
.\scripts\Stop-CyberSecureBackend.ps1
```

## 2. Start the Frontend

```powershell
cd web\cyber-secure-ar-client
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173
```

## 3. Login as Manager

Use:

```text
Usuario: gestor.carlos
Senha: Gestor@123
```

This user has access to the admin area.

## 4. Show the Main Pages

Recommended order:

1. Login page
2. Assistant page
3. Dashboard page
4. Admin page
5. Profile page

## 5. Show Passkey Registration

1. Login with username and password.
2. Go to `/profile`.
3. Click to register a passkey.
4. Complete the Windows Hello/browser prompt.
5. Logout.
6. Login again using "Entrar com passkey".

Important: passkeys are stored in memory in the current MVP. Restarting the backend can clear registered passkeys.

## 6. Explain the Security Value

Main talking points:

- password is not the only authentication mechanism
- passkey uses cryptographic proof
- user role controls access
- device ID adds operational context
- audit records relevant actions
- admin page supports monitoring
- dashboard gives risk visibility

## 7. Suggested Closing Message

The project is a proof of concept for secure operational access. It is not just a login screen; it combines identity, device context, audit, monitoring and AI assistance in one architecture.
