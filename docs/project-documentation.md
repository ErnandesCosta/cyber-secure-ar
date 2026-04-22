# CyberSecure AR - Documentacao do Projeto

## Introducao

O **CyberSecure AR** e uma plataforma de seguranca operacional criada para apoiar profissionais em campo, especialmente em cenarios industriais, ambientes criticos e operacoes com smart glasses.

A proposta do projeto e unir autenticacao forte, controle de acesso por perfil, contexto de dispositivo, assistente de IA e monitoramento SOC em uma unica experiencia. Em vez de ser apenas uma tela de login ou um chatbot, o sistema simula uma arquitetura de acesso seguro para operacoes sensiveis.

## Problema que o projeto resolve

Em operacoes criticas, o acesso a informacoes tecnicas nao pode depender apenas de usuario e senha. O sistema precisa considerar quem esta acessando, qual dispositivo esta sendo usado, qual o nivel de permissao do usuario e se existe alguma atividade suspeita.

O CyberSecure AR resolve esse problema com:

- login tradicional com JWT
- login moderno com passkeys/WebAuthn
- controle de acesso por perfil
- identificacao de dispositivo
- auditoria de eventos
- dashboard de risco e incidentes
- area administrativa para monitoramento
- assistente de IA com respostas controladas pelo nivel de acesso

## Objetivo

O objetivo principal e demonstrar uma solucao de ciberseguranca aplicada ao contexto operacional, com foco em:

- proteger acesso a informacoes sensiveis
- reduzir risco de credenciais roubadas
- dar visibilidade para gestores e analistas
- registrar acoes importantes para auditoria
- criar uma base evolutiva para integracao com telemetria real

## Visao geral da solucao

O sistema possui dois blocos principais:

- **Backend .NET 8**: responsavel por autenticacao, autorizacao, auditoria, passkeys, regras de acesso e APIs.
- **Frontend React**: responsavel pela experiencia visual, login, painel SOC, perfil, passkeys, assistente e tela administrativa.

A comunicacao entre frontend e backend acontece por API HTTP usando JSON. Apos o login, o backend emite um token JWT. Esse token e enviado nas proximas requisicoes para validar o usuario e suas permissoes.

## Funcionalidades implementadas

### Autenticacao

O projeto possui login com usuario e senha e tambem suporte a passkeys. O login tradicional serve para entrada inicial, enquanto a passkey permite uma autenticacao mais moderna, baseada no autenticador do dispositivo.

Usuarios disponiveis para teste:

| Perfil | Usuario | Senha | Acesso |
|---|---|---|---|
| Tecnico | `tecnico.joao` | `Tecnico@123` | Acesso operacional basico |
| Especialista | `especialista.ana` | `Especialista@123` | Acesso tecnico ampliado |
| Gestor | `gestor.carlos` | `Gestor@123` | Acesso completo e area admin |

### Passkeys e biometria

O projeto implementa passkeys com WebAuthn/FIDO2. Na pratica, isso permite usar recursos do dispositivo como Windows Hello, biometria, PIN ou chave de seguranca fisica.

O fluxo e:

1. O usuario entra com senha.
2. Acessa a pagina de perfil.
3. Cadastra uma passkey.
4. Em logins futuros, pode usar a opcao "Entrar com passkey".

A biometria e valida como opcao quando usada via WebAuthn/passkey, porque o backend nao recebe a digital ou o rosto do usuario. O dispositivo apenas prova criptograficamente que o usuario autorizou o acesso.

### Controle de acesso

O sistema usa perfis para limitar recursos:

- **Technician**: acesso a operacao e dados internos.
- **Specialist**: acesso tecnico maior, incluindo conteudos restritos.
- **Manager**: acesso completo, incluindo area administrativa e visao mais ampla de auditoria.

### Assistente operacional

O assistente foi pensado para apoiar o usuario em campo. Ele responde dentro do escopo permitido pelo perfil e gera eventos auditaveis.

Isso evita que a IA seja tratada como um chat livre sem controle. O diferencial e que a IA fica dentro de uma estrutura de seguranca.

### Dashboard SOC

O dashboard mostra indicadores de seguranca, tendencias, incidentes e sinais de risco. Ele funciona como uma visao de monitoramento para acompanhar a postura do ambiente.

### Area administrativa

A rota `/admin` e voltada para gestor. Ela centraliza informacoes de monitoramento e ajuda a visualizar eventos, riscos e situacoes que podem exigir acao.

### Auditoria

Eventos importantes sao registrados, como logins, consultas, acessos negados e acoes de seguranca. Isso permite rastrear o comportamento do sistema e apoiar uma investigacao futura.

## Arquitetura

A arquitetura segue uma separacao por camadas:

- `Domain`: entidades, enums e regras centrais.
- `Application`: DTOs, interfaces, validadores e casos de uso.
- `Infrastructure`: implementacoes concretas, repositorios em memoria, auditoria, token e servicos.
- `API`: controllers, middleware, autenticacao, CORS, Swagger e configuracoes.
- `web/cyber-secure-ar-client`: aplicacao React.

Essa divisao deixa o projeto mais organizado e facilita evoluir para banco de dados real, integracoes externas e testes automatizados mais completos.

## Como executar

### Backend

```powershell
cd src\CyberSecureAR.API
dotnet run
```

A API deve subir em:

```text
http://localhost:5000
```

Swagger:

```text
http://localhost:5000
```

Se aparecer erro de arquivo bloqueado por `CyberSecureAR.API`, pare o processo antigo:

```powershell
.\scripts\Stop-CyberSecureBackend.ps1
```

### Frontend

```powershell
cd web\cyber-secure-ar-client
npm run dev
```

O Vite geralmente abre em:

```text
http://localhost:5173
```

Se a porta estiver ocupada, ele pode abrir em `5174`, `5175` ou outra porta local. O backend ja foi ajustado para aceitar as portas locais comuns.

## Rotas principais

| Rota | Descricao |
|---|---|
| `/` | Login |
| `/assistant` | Assistente operacional |
| `/dashboard` | Dashboard SOC |
| `/admin` | Monitoramento administrativo |
| `/profile` | Perfil, postura de seguranca e passkeys |

## Endpoints principais

### Autenticacao

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

## Status atual

O projeto esta em um nivel bom para MVP tecnico ou prova de conceito avancada. Ele demonstra uma proposta coerente, moderna e defensavel para seguranca operacional.

Pontos fortes:

- proposta clara e atual
- uso de passkeys/WebAuthn
- separacao de backend em camadas
- frontend moderno com rotas separadas
- dashboard e tela admin
- auditoria e controle por perfil
- documentacao e testes iniciais

Limitacoes atuais:

- dados ainda ficam em memoria
- nao ha banco de dados persistente
- nao existe integracao com telemetria OT/IT real
- a suite de testes ainda e pequena
- a IA ainda opera como simulacao/local, sem integracao com um provedor real

## Melhorias recomendadas

Para transformar o projeto em uma opcao mais proxima de producao, os proximos passos seriam:

1. Adicionar banco de dados real, como PostgreSQL ou SQL Server.
2. Persistir usuarios, passkeys, auditorias, dispositivos e incidentes.
3. Criar cadastro e gerenciamento de usuarios.
4. Implementar refresh token e expiracao mais robusta.
5. Adicionar testes de API e testes end-to-end no frontend.
6. Integrar telemetria real de dispositivos, SIEM ou ferramentas OT.
7. Criar regras de risco mais avancadas.
8. Adicionar pipeline CI/CD.
9. Melhorar observabilidade com logs estruturados, metricas e tracing.
10. Preparar deploy com Docker e variaveis seguras.

## Conclusao

O CyberSecure AR e uma excelente opcao como projeto academico, demonstracao tecnica, portfolio avancado ou base para uma prova de conceito empresarial. A ideia e forte porque combina temas atuais: identidade, passkeys, IA, auditoria, SOC, dispositivo confiavel e operacao critica.

O projeto ainda nao deve ser tratado como produto pronto para producao, principalmente por usar persistencia em memoria e dados simulados. Porem, como arquitetura inicial e demonstracao de capacidade tecnica, ele esta bem direcionado e tem potencial real de evolucao.
