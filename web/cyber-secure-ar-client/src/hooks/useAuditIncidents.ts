import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import type { AuditIncidentDto } from "../types/audit";

export const useAuditIncidents = () => {
  const [incidents, setIncidents] = useState<AuditIncidentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      const data = await apiService.getAuditIncidents();
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar incidentes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  return { incidents, isLoading, error };
};
