# Architecture

## Overview

CyberSecure AR uses a layered architecture with a .NET backend and a React frontend.

The main goal is to keep business rules, application use cases, infrastructure services and API delivery separated. This makes the project easier to test and easier to evolve into a production-ready system.

## Backend Layers

### Domain

Path: `src/CyberSecureAR.Domain`

Contains the core business model:

- users
- passkey credentials
- documents
- audit events
- blocked devices
- assistant queries and responses
- enums and value objects

### Application

Path: `src/CyberSecureAR.Application`

Contains application-level contracts and use cases:

- DTOs
- repository interfaces
- token and audit interfaces
- validators
- authentication use case
- assistant query use case

### Infrastructure

Path: `src/CyberSecureAR.Infrastructure`

Contains concrete implementations:

- in-memory repositories
- JWT token service
- audit service
- anomaly detection
- device block service
- AI service simulation
- sensitive data filtering

### API

Path: `src/CyberSecureAR.API`

Contains HTTP delivery:

- controllers
- middleware
- dependency injection
- JWT configuration
- CORS configuration
- Swagger
- WebAuthn/FIDO2 passkey endpoints

## Frontend

Path: `web/cyber-secure-ar-client`

The frontend is built with React, TypeScript and Vite. It contains:

- login page
- assistant page
- dashboard page
- admin monitoring page
- profile/passkey page
- shared API service
- auth context

The frontend uses route-level lazy loading to reduce the initial bundle size.

## Authentication Flow

1. User submits username, password and device ID.
2. API validates credentials.
3. API creates a JWT with user claims.
4. Frontend stores the token.
5. Future requests send the JWT in the `Authorization` header.

## Passkey Flow

1. Authenticated user opens profile.
2. Frontend requests WebAuthn registration options.
3. Browser creates a credential using the local authenticator.
4. API verifies the attestation and stores the public credential data.
5. Future login can use the passkey assertion flow.

## Current Persistence Model

The project currently uses in-memory persistence for demo purposes. This is useful for a proof of concept, but should be replaced by a database before production use.
