import { useState, useCallback, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { LoginRequest, UserProfile } from "../types/auth";
import { apiService } from "../services/apiService";
import { tokenStorage } from "../utils/tokenStorage";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]           = useState<UserProfile | null>(
    tokenStorage.getUser<UserProfile>()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.login(data);
      tokenStorage.setToken(response.token);
      const profile  = await apiService.getMe();
      tokenStorage.setUser(profile);
      setUser(profile);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};