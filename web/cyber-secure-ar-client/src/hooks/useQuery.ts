import { useState, useCallback } from "react";
import type { AssistantResponseDto } from "../types/query";
import { apiService } from "../services/apiService";

export const useQuery = () => {
  const [response, setResponse]   = useState<AssistantResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const sendQuery = useCallback(async (question: string) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    try {
      const result = await apiService.query({
        question,
        deviceId: import.meta.env.VITE_DEVICE_ID || "AR-GLASSES-DEMO-001",
      });
      setResponse(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao processar.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return { response, isLoading, error, sendQuery, reset };
};