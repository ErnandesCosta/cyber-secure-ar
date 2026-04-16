using CyberSecureAR.Domain.Entities;
using CyberSecureAR.Domain.Enums;

namespace CyberSecureAR.Infrastructure.Persistence;

public static class DocumentsData
{
    public static List<Document> GetSeedDocuments() =>
    [
        Document.Create(
            title: "Procedimento de Inspeção de Válvulas",
            content: "Para inspeção de válvulas de segurança, o técnico deve verificar: " +
                     "1. Pressão de operação dentro do limite. " +
                     "2. Ausência de vazamentos visíveis. " +
                     "3. Funcionamento do mecanismo de alívio. " +
                     "Equipamentos necessários: manômetro calibrado, detector de gás.",
            category: "Operação",
            classification: DocumentClassification.Internal
        ),
        Document.Create(
            title: "Manual de Segurança em Campo",
            content: "Todo técnico em campo deve utilizar EPIs obrigatórios: capacete, " +
                     "óculos de proteção, luvas e botas de segurança. " +
                     "Em caso de emergência, acionar o ramal 190 da central de operações.",
            category: "Segurança",
            classification: DocumentClassification.Public
        ),
        Document.Create(
            title: "Relatório de Manutenção Preditiva - Plataforma P-36",
            content: "Análise de vibração indica desgaste prematuro no rolamento B-12. " +
                     "Recomendação: substituição preventiva em até 30 dias. " +
                     "Custo estimado: R$ 48.000. Impacto operacional: mínimo.",
            category: "Manutenção",
            classification: DocumentClassification.Restricted
        ),
        Document.Create(
            title: "Plano Estratégico de Exploração 2026-2030",
            content: "Investimento previsto de USD 8,5 bilhões no pré-sal. " +
                     "Novos blocos de exploração identificados nas bacias de Santos e Campos. " +
                     "Meta de produção: 2,2 milhões de barris/dia até 2028. " +
                     "Dados confidenciais — acesso restrito à diretoria.",
            category: "Estratégia",
            classification: DocumentClassification.Confidential
        ),
        Document.Create(
            title: "Checklist Diário de Operação",
            content: "1. Verificar níveis de pressão nos painéis de controle. " +
                     "2. Confirmar comunicação com a central. " +
                     "3. Registrar leituras de temperatura dos equipamentos. " +
                     "4. Reportar anomalias imediatamente ao supervisor.",
            category: "Operação",
            classification: DocumentClassification.Internal
        ),
        Document.Create(
            title: "Credenciais e Acessos de Sistemas",
            content: "SISTEMA SCADA: usuário admin / senha Petr0br@s#2026. " +
                     "VPN corporativa: token rotativo via aplicativo. " +
                     "Banco de dados: host 10.0.0.1, porta 5432.",
            category: "TI",
            classification: DocumentClassification.Confidential
        )
    ];
}