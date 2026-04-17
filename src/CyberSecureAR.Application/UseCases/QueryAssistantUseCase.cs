using CyberSecureAR.Application.DTOs;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Application.Validators;
using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.Exceptions;
using CyberSecureAR.Domain.ValueObjects;

namespace CyberSecureAR.Application.UseCases;

public class QueryAssistantUseCase(
    IAIService           aiService,
    IDocumentRepository  documentRepository,
    IAuditService        auditService,
    ISensitiveDataFilter sensitiveDataFilter,
    IDeviceBlockService  deviceBlockService,
    IAnomalyDetector     anomalyDetector)
{
    public async Task<AssistantResponseDto> ExecuteAsync(
        AssistantQueryDto dto,
        AccessClaim       claim,
        string            ipAddress,
        string            correlationId)
    {
        // 0. Verifica se dispositivo está bloqueado
        if (await deviceBlockService.IsBlockedAsync(dto.DeviceId))
        {
            await auditService.LogAsync(SecurityAudit.Create(
                action:        "QUERY_BLOCKED_DEVICE",
                resource:      "assistant/query",
                wasAllowed:    false,
                ipAddress:     ipAddress,
                deviceId:      dto.DeviceId,
                correlationId: correlationId,
                blockReason:   "Dispositivo bloqueado por anomalia detectada"
            ));
            throw new SecurityViolationException(
                "DEVICE_BLOCKED",
                "Este dispositivo foi bloqueado por atividade suspeita.");
        }

        // 1. Verifica anomalias com base no histórico
        var allAudits = await auditService.GetAllAsync();
        var anomaly   = await anomalyDetector.AnalyzeAsync(dto.DeviceId, allAudits);

        if (anomaly.IsAnomaly)
        {
            await deviceBlockService.BlockAsync(dto.DeviceId, anomaly.Reason, anomaly.AnomalyScore);
            await auditService.LogAsync(SecurityAudit.Create(
                action:        "ANOMALY_DETECTED",
                resource:      "assistant/query",
                wasAllowed:    false,
                ipAddress:     ipAddress,
                deviceId:      dto.DeviceId,
                correlationId: correlationId,
                blockReason:   anomaly.Reason
            ));
            throw new SecurityViolationException(
                "ANOMALY_DETECTED",
                $"Comportamento anômalo detectado: {anomaly.Reason}");
        }

        // 2. Valida prompt injection
        var (isValid, error) = QueryValidator.Validate(dto.Question);
        if (!isValid)
        {
            await auditService.LogAsync(SecurityAudit.Create(
                action:        "QUERY_INJECTION_ATTEMPT",
                resource:      "assistant/query",
                wasAllowed:    false,
                ipAddress:     ipAddress,
                deviceId:      dto.DeviceId,
                correlationId: correlationId,
                blockReason:   error
            ));
            throw new SecurityViolationException("PROMPT_INJECTION", error!);
        }

        // 3. Busca documentos autorizados — usa MaxClassification do AccessClaim
        var documents = await documentRepository.SearchAsync(
            dto.Question,
            claim.MaxClassification);

        if (!documents.Any())
        {
            await auditService.LogAsync(SecurityAudit.Create(
                action:        "QUERY_NO_ACCESS",
                resource:      "assistant/query",
                wasAllowed:    false,
                ipAddress:     ipAddress,
                deviceId:      dto.DeviceId,
                correlationId: correlationId,
                blockReason:   "Nenhum documento autorizado encontrado"
            ));
            throw new UnauthorizedDomainAccessException(
                "assistant/query",
                "Nenhum documento autorizado para este perfil");
        }

        // 4. Gera resposta com IA
        var rawAnswer = await aiService.GenerateResponseAsync(dto.Question, documents);

        // 5. Filtra dados sensíveis
        var (filteredAnswer, wasFiltered) = sensitiveDataFilter.Filter(rawAnswer);

        await auditService.LogAsync(SecurityAudit.Create(
            action:        "QUERY_ASSISTANT",
            resource:      "assistant/query",
            wasAllowed:    true,
            ipAddress:     ipAddress,
            deviceId:      dto.DeviceId,
            correlationId: correlationId,
            blockReason:   wasFiltered ? "Dados sensíveis removidos da resposta" : null
        ));

        return new AssistantResponseDto(
            Answer:      filteredAnswer,
            WasFiltered: wasFiltered,
            AccessLevel: claim.Role.ToString(),
            GeneratedAt: DateTime.UtcNow
        );
    }
}
