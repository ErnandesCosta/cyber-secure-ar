# API Specification

Base URL:

```text
http://localhost:5000
```

Swagger:

```text
http://localhost:5000
```

## Common Headers

Authenticated requests should include:

```text
Authorization: Bearer {token}
X-Device-Id: AR-GLASSES-DEMO-001
X-Correlation-Id: {unique-id}
Content-Type: application/json
```

## Auth

### POST `/api/auth/login`

Authenticates a user with username, password and device ID.

Request:

```json
{
  "username": "gestor.carlos",
  "password": "Gestor@123",
  "deviceId": "AR-GLASSES-DEMO-001"
}
```

Response:

```json
{
  "token": "jwt-token",
  "fullName": "Carlos Menezes",
  "role": "Manager",
  "department": "Diretoria Operacional",
  "expiresAt": "2026-01-01T00:00:00Z"
}
```

### GET `/api/auth/me`

Returns the authenticated user profile.

## Passkeys

### GET `/api/passkeys`

Lists registered passkeys for the authenticated user.

### POST `/api/passkeys/registration/options`

Creates WebAuthn registration options.

Request:

```json
{
  "label": "Windows Hello"
}
```

### POST `/api/passkeys/registration/verify`

Verifies the browser registration response and stores the passkey credential.

### POST `/api/passkeys/authentication/options`

Creates WebAuthn authentication options for a username.

Request:

```json
{
  "username": "gestor.carlos"
}
```

### POST `/api/passkeys/authentication/verify`

Verifies the passkey assertion and returns a login response with JWT.

### DELETE `/api/passkeys/{credentialId}`

Removes a passkey from the authenticated user's profile.

## Assistant

### POST `/api/assistant/query`

Sends an operational question to the assistant.

The response depends on the user's role and access level.

## Audit

### GET `/api/audit/events`

Returns audit events visible to the current user.

### GET `/api/audit/summary`

Returns aggregated audit metrics.

### GET `/api/audit/trends`

Returns trend data for dashboard charts.

### GET `/api/audit/incidents`

Returns incident-like audit findings.

## Security

### GET `/api/security/blocked-devices`

Lists blocked devices. Requires manager access.

### DELETE `/api/security/blocked-devices/{deviceId}`

Unblocks a device. Requires manager access.

### GET `/api/security/anomalies/{deviceId}`

Returns anomaly information for a device.
