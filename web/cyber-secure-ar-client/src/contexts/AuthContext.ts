import { createContext, useContext } from "react";
import type { LoginRequest, PasskeyLoginRequest, UserProfile } from "../types/auth";

export interface AuthContextData {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  loginWithPasskey: (data: PasskeyLoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
