# Product Status

## O que o projeto é hoje

O **CyberSecure AR** é uma plataforma de cibersegurança operacional para uso em campo com smart glasses, assistente de IA com escopo controlado, auditoria contínua e monitoramento SOC por perfil.

Ele atende bem como **prova de conceito forte / MVP técnico de hackathon**, porque já demonstra:

- autenticação com JWT e `deviceId`
- RBAC por perfis (`Technician`, `Specialist`, `Manager`)
- assistente com filtragem e trilha de auditoria
- dashboard SOC com resumo, incidentes, tendências e bloqueios
- área administrativa dedicada para monitoramento gerencial

## O que já está implementado

### Frontend

- tela de login modernizada
- fluxo visual de segundo fator biométrico
- assistente operacional com sugestões e retorno seguro
- dashboard SOC com risco, alertas, incidentes e exportação PDF
- página de perfil com postura de acesso e recomendações
- rota administrativa `/admin` exclusiva para `Manager`

### Backend

- autenticação e emissão de token
- endpoints de resumo, tendências, eventos e incidentes
- bloqueio e desbloqueio de dispositivos
- middlewares de segurança e auditoria
- políticas de autorização por papel

## O que ainda é demo ou parcial

- biometria no frontend está preparada como experiência e detecção de suporte local, mas **não conclui um registro/autenticação WebAuthn ponta a ponta**
- persistência ainda está baseada em estrutura simplificada / mock em partes do projeto
- monitoramento ainda é orientado a eventos da própria aplicação, não a telemetria OT real

## Próximos passos para virar produto forte

1. Implementar WebAuthn real no backend.
2. Persistir credenciais, dispositivos confiáveis e eventos em banco relacional.
3. Criar inventário de ativos e vincular `deviceId` a attestation / confiança do ativo.
4. Adicionar step-up auth por risco.
5. Integrar fontes OT/IT reais para o SOC.
6. Criar playbooks operacionais e fila de investigação com workflow.
7. Adicionar testes E2E do frontend e testes de autorização por papel.

## Avaliação objetiva

Como proposta, o projeto é **muito bom** e está alinhado com um cenário real de indústria crítica porque combina:

- identidade
- contexto de dispositivo
- controle de acesso
- observabilidade de segurança
- IA com restrição de escopo

O diferencial está em não tratar IA isoladamente, mas como parte de uma arquitetura de acesso seguro para operação crítica.
