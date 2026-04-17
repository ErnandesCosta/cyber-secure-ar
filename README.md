<div align="center">

# 🥽 CyberSecure AR

**Plataforma de Segurança Operacional com Inteligência Artificial para Smart Glasses**

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> Projeto desenvolvido para o Hackathon Petrobras — Temática: Cibersegurança Operacional

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
  - [Com Docker](#com-docker-recomendado)
  - [Manual](#manual)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Usuários de Teste](#-usuários-de-teste)
- [Fluxo de Segurança](#-fluxo-de-segurança)
- [Como a IA trabalha](#-como-a-ia-trabalha)
- [SOC — Centro de Operações de Segurança](#-soc--centro-de-operaes-de-seguran-a)
- [Contribuindo](#-contribuindo)
- [Equipe](#-equipe)

---

## 🎯 Sobre o Projeto

O **CyberSecure AR** é uma plataforma de segurança operacional que integra **Inteligência Artificial** com **smart glasses** para auxiliar técnicos de campo em ambientes industriais críticos — como plataformas de petróleo e refinarias.

### Problema que resolve

Técnicos de campo precisam acessar informações sensíveis em tempo real enquanto realizam manutenções. O acesso inadequado a sistemas críticos representa um dos maiores vetores de ataques cibernéticos em ambientes industriais (OT/IT). O CyberSecure AR resolve isso através de:

- **Autenticação forte** com JWT + verificação de dispositivo registrado
- **Assistente IA** com filtros de segurança que bloqueiam consultas suspeitas
- **Controle de acesso baseado em perfil** (Técnico / Especialista / Gestor)
- **Auditoria completa** de todas as interações e tentativas de acesso

### Como funciona

[Smart Glasses] → [Autenticação JWT] → [Assistente IA] → [Resposta filtrada]
↓
[Verificação de Dispositivo]
↓
[Controle de Acesso (RBAC)]
↓
[Log de Auditoria]

O fluxo combina autenticação, verificação de dispositivo e filtragem de IA para garantir que apenas informações autorizadas sejam retornadas.

---

## 🏗 Arquitetura

O projeto segue os princípios de **Clean Architecture**, garantindo separação de responsabilidades, testabilidade e facilidade de manutenção.

┌─────────────────────────────────────────────────┐
│ Presentation │
│ React + TypeScript (Smart Glasses UI) │
└──────────────────────┬──────────────────────────┘
│ HTTP / REST
┌──────────────────────▼──────────────────────────┐
│ API Layer (.NET) │
│ Controllers → Use Cases → Domain → Infra │
│ │
│ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│ │ Domain │ │ AppUC │ │ Infrastructure │ │
│ │ Entities │ │ Services │ │ JWT / EF Core │ │
│ │ Enums │ │ UseCases │ │ PostgreSQL │ │
│ │ VOs │ │ │ │ AI Service │ │
│ └──────────┘ └──────────┘ └────────────────┘ │
└──────────────────────┬──────────────────────────┘
│
┌──────────────────────▼──────────────────────────┐
│ PostgreSQL 16 │
└─────────────────────────────────────────────────┘

### Camadas do Backend

| Camada | Responsabilidade |
|--------|-----------------|
| `CyberSecureAR.Domain` | Entidades, Value Objects, Enums, Exceções de domínio |
| `CyberSecureAR.Application` | Use Cases, DTOs, Interfaces de serviço |
| `CyberSecureAR.Infrastructure` | JWT, EF Core, PostgreSQL, Serviço de IA |
| `CyberSecureAR.API` | Controllers, Middlewares, Configuração da aplicação |

---

## 🛠 Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| .NET | 9.0 | Framework principal |
| ASP.NET Core | 9.0 | API REST |
| Entity Framework Core | 9.x | ORM |
| PostgreSQL | 16 | Banco de dados |
| JWT Bearer | 9.x | Autenticação |
| BCrypt.Net | 4.x | Hash de senhas |

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5.x | Tipagem estática |
| Vite | 6.x | Build tool |
| React Router DOM | 7.x | Roteamento |

### Infraestrutura
| Tecnologia | Uso |
|---|---|
| Docker + Docker Compose | Containerização |
| GitHub Actions | CI/CD |

---

## 📁 Estrutura do Repositório

cyber-secure-ar/
│
├── 📁 src/ # Backend (.NET)
│ ├── 📁 CyberSecureAR.API/
│ │ ├── 📁 Controllers/
│ │ │ ├── AssistantController.cs # Endpoints do assistente IA
│ │ │ └── AuthController.cs # Endpoints de autenticação
│ │ ├── 📁 Extensions/ # Extensões de serviços
│ │ ├── 📁 Middleware/ # Middlewares customizados
│ │ ├── 📁 Models/ # Models de resposta da API
│ │ ├── Program.cs
│ │ └── appsettings.json
│ │
│ ├── 📁 CyberSecureAR.Application/
│ │ ├── 📁 DTOs/ # Data Transfer Objects
│ │ ├── 📁 Interfaces/ # Contratos de serviços
│ │ └── 📁 UseCases/ # Casos de uso da aplicação
│ │
│ ├── 📁 CyberSecureAR.Domain/
│ │ ├── 📁 Entities/ # Entidades do domínio (User, etc.)
│ │ ├── 📁 Enums/ # Enumerações (UserRole, etc.)
│ │ ├── 📁 Exceptions/ # Exceções de domínio
│ │ └── 📁 ValueObjects/ # Value Objects (AccessClaim, etc.)
│ │
│ └── 📁 CyberSecureAR.Infrastructure/
│ ├── 📁 AI/ # Serviço de IA (Mock + integração)
│ ├── 📁 Auth/ # JWT Token Service
│ ├── 📁 Logging/ # Auditoria e logs
│ ├── 📁 Persistence/ # DbContext e repositórios
│ └── 📁 Security/ # Validações de segurança
│
├── 📁 web/ # Frontend (React)
│ └── 📁 cyber-secure-ar-client/
│ └── 📁 src/
│ ├── 📁 components/ # Componentes reutilizáveis
│ ├── 📁 contexts/ # Context API (Auth)
│ ├── 📁 hooks/ # Custom hooks
│ ├── 📁 pages/ # Páginas da aplicação
│ ├── 📁 services/ # Comunicação com a API
│ ├── 📁 types/ # Tipagens TypeScript
│ └── 📁 utils/ # Utilitários (tokenStorage)
│
├── 📁 tests/ # Testes automatizados
├── 📁 docs/ # Documentação adicional
├── docker-compose.yml
├── docker-compose.override.yml
└── CyberSecureAR.sln

O repositório foi organizado para separar backend, frontend e infraestrutura.

---

## ✅ Pré-requisitos

Certifique-se de ter instalado:

- [Docker](https://www.docker.com/get-started) + [Docker Compose](https://docs.docker.com/compose/) (**recomendado**)

**Ou, para execução manual:**

- [.NET SDK 8.0+](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16+](https://www.postgresql.org/download/)

---

## 🚀 Como Executar

### Com Docker (recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/ErnandesCosta/cyber-secure-ar.git
cd cyber-secure-ar

# 2. Suba todos os serviços
docker-compose up --build

# Acesse:
# Frontend:  http://localhost:5173
# API:       http://localhost:5000
# Swagger:   http://localhost:5000/swagger

---

## Manual

### Backend

```bash
cd src/CyberSecureAR.API
dotnet restore
dotnet run
```

> Se usar banco de dados real, ajuste a `DefaultConnection` em `appsettings.Development.json` e execute as migrações antes de rodar.

### Frontend

```bash
cd web/cyber-secure-ar-client
npm install
npm run dev
```

---

## 🔐 Variáveis de Ambiente

Backend — `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=cybersecure;Username=postgres;Password=postgres"
  },
  "TokenConfiguration": {
    "SecretKey": "sua-chave-secreta-minimo-32-caracteres",
    "Issuer": "CyberSecureAR",
    "Audience": "CyberSecureAR-Client",
    "ExpirationHours": 8
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:5173"]
  }
}
```

Frontend — `web/cyber-secure-ar-client/.env`

```text
VITE_API_URL=http://localhost:5000
VITE_DEVICE_ID=AR-GLASSES-DEMO-001
```

📡 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Realiza login e retorna JWT | ❌ |
| GET | `/api/auth/me` | Retorna perfil do usuário autenticado | ✅ |

### Assistente IA
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/api/assistant/query` | Envia consulta ao assistente de segurança | ✅ |
| GET | `/api/audit/events` | Retorna eventos de auditoria do usuário | ✅ |

### Exemplos de Request

#### Login
```json
POST /api/auth/login
{
  "username": "tecnico.joao",
  "password": "Tecnico@123",
  "deviceId": "AR-GLASSES-DEMO-001"
}
```

#### Consulta ao Assistente
```json
POST /api/assistant/query
Authorization: Bearer {token}
{
  "question": "Qual o procedimento para manutenção da válvula V-201?",
  "deviceId": "AR-GLASSES-DEMO-001"
}
```

### 👥 Usuários de Teste
| Perfil | Usuário | Senha | Permissões |
|---|---|---|---|
| Técnico | tecnico.joao | Tecnico@123 | Consultas básicas de manutenção |
| Especialista | especialista.ana | Especialista@123 | Consultas avançadas + relatórios |
| Gestor | gestor.carlos | Gestor@123 | Acesso total + auditoria |

### 🛡 Fluxo de Segurança
1. Usuário faz login com usuário, senha e device ID.
2. A API valida as credenciais e gera um JWT com claims.
3. O `deviceId` é incluído no token e também enviado no cabeçalho `X-Device-Id`.
4. O assistente recebe a pergunta e valida o prompt para evitar injeção.
5. A IA usa apenas documentos autorizados para o perfil do usuário.
6. A resposta é filtrada para remover dados sensíveis.
7. Auditoria registra todas as consultas e bloqueios.

### 🤖 Como a IA trabalha
- O texto do usuário é validado e o prompt é analisado para evitar injeção.
- O assistente acessa apenas documentos permitidos pelo perfil do usuário.
- A resposta é gerada pelo serviço de IA e, em seguida, passa por um filtro de dados sensíveis.
- Se houver conteúdo confidencial, ele é bloqueado ou sanitizado antes de ser retornado.
- Todas as interações são registradas para análise SOC.

### 🛰 SOC — Centro de Operações de Segurança
- Painel de auditoria com eventos permitidos e bloqueios.
- Monitoramento de dispositivo, usuário e IP em tempo real.
- Alertas de consultas não autorizadas ou comportamentos suspeitos.
- Controle de acesso baseado em perfil e trust de dispositivo.
- Logs de auditoria que permitem rastrear ações de segurança e conformidade.

### Exceções de Segurança Tratadas
| Exceção | Código HTTP | Descrição |
|---|---|---|
| SecurityViolationException | 400 | Consulta bloqueada por violar políticas |
| UnauthorizedDomainAccessException | 403 | Acesso a domínio não autorizado para o perfil |
| Token inválido/expirado | 401 | Autenticação necessária ou token expirado |
	
