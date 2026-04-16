namespace CyberSecureAR.Application.DTOs;

public record AssistantResponseDto(
    string Answer,
    bool WasFiltered,
    string AccessLevel,
    DateTime GeneratedAt
);