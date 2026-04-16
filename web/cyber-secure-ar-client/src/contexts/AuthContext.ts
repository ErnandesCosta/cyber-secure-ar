import { createContext } from "react";
import type { LoginRequest, UserProfile } from "../types/auth";

export interface AuthContextData {
  user:            UserProfile | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
  login:           (data: LoginRequest) => Promise<void>;
  logout:          () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);