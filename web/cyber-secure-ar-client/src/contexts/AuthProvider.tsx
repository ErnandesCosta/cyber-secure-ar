import { useState, useCallback, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { LoginRequest, LoginResponse, PasskeyLoginRequest, UserProfile } from "../types/auth";
import { apiService } from "../services/apiService";
import { tokenStorage } from "../utils/tokenStorage";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(
    tokenStorage.getUser<UserProfile>(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyAuthenticatedSession = useCallback(async (response: LoginResponse) => {
    tokenStorage.setToken(response.token);
    const profile = await apiService.getMe();
    tokenStorage.setUser(profile);
    setUser(profile);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.login(data);
      await applyAuthenticatedSession(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthenticatedSession]);

  const loginWithPasskey = useCallback(async (data: PasskeyLoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const options = await apiService.beginPasskeyAuthentication(data.username);
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const response = await startAuthentication({ optionsJSON: options });
      const loginResponse = await apiService.verifyPasskeyAuthentication({
        username: data.username,
        response,
      });
      await applyAuthenticatedSession(loginResponse);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falha ao autenticar com passkey.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthenticatedSession]);

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, error, login, loginWithPasskey, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
