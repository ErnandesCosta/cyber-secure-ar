using System.Linq;
using CyberSecureAR.Application.DTOs;
using CyberSecureAR.Application.Interfaces;
using CyberSecureAR.Application.Validators;
using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.Enums;
using CyberSecureAR.Domain.Exceptions;
using CyberSecureAR.Domain.ValueObjects;

namespace CyberSecureAR.Application.UseCases;

public class QueryAssistantUseCase(
    IDocumentRepository documentRepository,
    IAIService aiService,
    IAuditService auditService,
    ISensitiveDataFilter sensitiveDataFilter
)
{
    public async Task<AssistantResponseDto> ExecuteAsync(
        AssistantQueryDto dto,
        AccessClaim claim,
        string ipAddress)
    {
        // 1. Valida a pergunta contra prompt injection
        var (isValid, error) = QueryValidator.Validate(dto.Question);
        if (!isValid)
        {
            await auditService.LogAsync(SecurityAudit.Create(
                userId: claim.UserId,
                action: "QUERY_BLOCKED_INJECTION",
                resource: "assistant/query",
                wasAllowed: false,
                ipAddress: ipAddress,
                deviceId: dto.DeviceId,
                blockReason: error
            ));

            throw new SecurityViolationException(
                "PROMPT_INJECTION",
                "Pergunta bloqueada por política de segurança."
            );
        }

        // 2. Verifica intenção de extração de dados sensíveis
        bool hasExtractionIntent = QueryValidator.HasExtractionIntent(dto.Question);

        // 3. Define nível máximo de acesso do usuário
        var maxClassification = claim.Role switch
        {
            Domain.Enums.UserRole.Manager    => DocumentClassification.Confidential,
            Domain.Enums.UserRole.Specialist => DocumentClassification.Restricted,
            _                                => DocumentClassification.Internal
        };

        // 4. Busca documentos permitidos para o perfil
        var documents = (await documentRepository.SearchAsync(
            dto.Question,
            maxClassification
        ))
            .Where(d => d.Classification <= maxClassification)
            .ToList();

        // 5. Gera resposta com IA usando apenas o contexto autorizado
        var rawResponse = await aiService.GenerateResponseAsync(
            dto.Question,
            documents
        );

        // 6. Filtra a saída para remover dados sensíveis
        var filteredResponse = sensitiveDataFilter.Filter(rawResponse);
        bool wasFiltered = filteredResponse != rawResponse;

        // 7. Se havia intenção de extração, retorna mensagem segura
        if (hasExtractionIntent && wasFiltered)
        {
            filteredResponse = "Acesso negado: a resposta contém informações restritas para seu perfil.";
        }

        // 8. Registra auditoria
        await auditService.LogAsync(SecurityAudit.Create(
            userId: claim.UserId,
            action: wasFiltered ? "QUERY_FILTERED" : "QUERY_ALLOWED",
            resource: "assistant/query",
            wasAllowed: true,
            ipAddress: ipAddress,
            deviceId: dto.DeviceId,
            blockReason: wasFiltered ? "Dados sensíveis removidos da resposta" : null
        ));

        return new AssistantResponseDto(
            Answer: filteredResponse,
            WasFiltered: wasFiltered,
            AccessLevel: claim.Role.ToString(),
            GeneratedAt: DateTime.UtcNow
        );
    }
}