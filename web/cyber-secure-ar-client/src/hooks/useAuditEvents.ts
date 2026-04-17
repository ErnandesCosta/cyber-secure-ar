import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import type { SecurityAuditDto } from "../types/audit";

const POLL_INTERVAL_MS = 10000;

export const useAuditEvents = () => {
  const [events, setEvents] = useState<SecurityAuditDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadEvents = async () => {
      try {
        const response = await apiService.getAuditEvents();
        if (active) {
          setEvents(response);
          setError(null);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Falha ao carregar eventos.";
        if (active) setError(message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadEvents();
    intervalId = setInterval(loadEvents, POLL_INTERVAL_MS);

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return { events, isLoading, error };
};
