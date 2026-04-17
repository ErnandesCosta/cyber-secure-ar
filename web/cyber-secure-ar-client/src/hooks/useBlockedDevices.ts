import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import type { BlockedDeviceDto } from "../types/security";

export const useBlockedDevices = () => {
  const [devices, setDevices]     = useState<BlockedDeviceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      const data = await apiService.getBlockedDevices();
      setDevices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dispositivos.");
    } finally {
      setIsLoading(false);
    }
  };

  const unblock = async (deviceId: string) => {
    await apiService.unblockDevice(deviceId);
    await fetchDevices();
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 15000);
    return () => clearInterval(interval);
  }, []);

  return { devices, isLoading, error, unblock };
};
