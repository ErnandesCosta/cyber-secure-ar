import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import type { AuditSummary } from "../types/auditSummary";

export const useAuditSummary = () => {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadSummary = async () => {
      try {
        const response = await apiService.getAuditSummary();
        if (active) setSummary(response);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Falha ao carregar resumo.";
        if (active) setError(message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  return { summary, isLoading, error };
};
