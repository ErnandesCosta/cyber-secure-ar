export interface AssistantQueryDto {
  question: string;
  deviceId: string;
}

export interface AssistantResponseDto {
  answer: string;
  wasFiltered: boolean;
  accessLevel: string;
  generatedAt: string;
}