# Product Status

## O que o projeto e hoje

O **CyberSecure AR** e uma plataforma de ciberseguranca operacional para uso em campo com smart glasses, assistente de IA com escopo controlado, auditoria continua, passkeys e monitoramento SOC por perfil.

Hoje ele funciona bem como **MVP tecnico forte / prova de conceito avancada**.

## O que ja esta implementado

### Frontend

- login modernizado com credencial tradicional
- login com passkey/WebAuthn
- cadastro e remocao de passkeys na pagina de perfil
- assistente operacional com resposta auditavel
- dashboard SOC com risco, tendencias, incidentes e exportacao
- area administrativa dedicada para gestores

### Backend

- autenticacao com JWT
- endpoints de registro e autenticacao com passkeys via FIDO2/WebAuthn
- controle de acesso por papel
- auditoria, incidentes, tendencias e anomalias
- bloqueio e desbloqueio de dispositivos

## O que ainda e parcial

- a persistencia ainda e simplificada e baseada em armazenamento em memoria em partes da aplicacao
- o monitoramento ainda observa principalmente eventos da propria plataforma, nao telemetria OT real
- o fluxo biometrico visual do login continua como experiencia guiada; o endurecimento real esta no login por passkey
- a pasta `tests/` ainda nao representa uma suite valida: o `.csproj` e os arquivos de teste estao vazios

## Proximos passos recomendados

1. Persistir credenciais, eventos e dispositivos em banco relacional.
2. Vincular `deviceId` a inventario confiavel e attestation do ativo.
3. Adicionar step-up auth por risco apos o login.
4. Integrar telemetria OT/IT real ao SOC.
5. Criar workflow de triagem e playbooks de resposta.
6. Implementar uma base real de testes automatizados.

## Avaliacao objetiva

Como proposta, o projeto e forte porque combina:

- identidade
- contexto de dispositivo
- controle de acesso
- observabilidade de seguranca
- IA com restricao de escopo

O diferencial esta em tratar IA como parte de uma arquitetura de acesso seguro para operacao critica, e nao como um chat isolado.
