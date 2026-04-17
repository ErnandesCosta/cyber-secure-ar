import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import type { AuditTrendDto } from "../types/audit";

export const useAuditTrends = () => {
  const [trends, setTrends]       = useState<AuditTrendDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchTrends = async () => {
    try {
      const data = await apiService.getAuditTrends();
      setTrends(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar tendências.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    const interval = setInterval(fetchTrends, 15000);
    return () => clearInterval(interval);
  }, []);

  return { trends, isLoading, error };
};
