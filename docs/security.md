# Security Model

## Security Goals

CyberSecure AR focuses on secure access for operational environments. The main goals are:

- verify user identity
- bind requests to a device context
- reduce password-only dependency
- enforce role-based access
- audit relevant actions
- expose risk indicators to managers

## Authentication

The project supports two authentication methods:

- username and password
- passkey/WebAuthn

Password authentication is used as the initial access method. Passkeys provide a stronger option because the private key stays on the user's device and the server only stores public credential data.

## Passkeys and Biometrics

Biometrics are valid in this project when used through WebAuthn/passkeys. The backend does not receive fingerprint or face data. The operating system or hardware authenticator performs the biometric verification locally and only returns a cryptographic proof to the application.

This is safer than trying to send biometric data to the backend.

## Authorization

The system uses role-based access:

| Role | Access |
|---|---|
| `Technician` | Operational access and internal information |
| `Specialist` | Expanded technical access |
| `Manager` | Full access, including admin monitoring |

JWT claims carry the user identity, role, department and device context.

## Device Context

Requests include a device identifier through `X-Device-Id`. In the MVP this value is simplified, but it prepares the architecture for a future trusted device inventory.

Recommended evolution:

- device registry
- device attestation
- risk score per device
- automatic blocking
- step-up authentication for suspicious devices

## Auditing

The project records important security events, including:

- successful login
- failed login
- passkey registration
- passkey authentication
- assistant access
- blocked or denied operations

This supports traceability and investigation.

## Current Limitations

- data is still stored in memory
- device trust is simulated
- audit data is not persisted in a database
- no external SIEM integration yet
- test coverage is still small

## Production Recommendations

Before production use, add:

- persistent database
- secure secret storage
- HTTPS-only deployment
- stricter CORS by environment
- refresh token strategy
- rate limiting
- account lockout policy
- SIEM/log forwarding
- stronger device attestation
- automated security tests
