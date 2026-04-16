import { tokenStorage } from "../utils/tokenStorage";
import type { LoginRequest, LoginResponse, UserProfile } from "../types/auth";
import type { AssistantQueryDto, AssistantResponseDto } from "../types/query";
import type { ApiErrorResponse } from "../types/api";

const BASE_URL  = import.meta.env.VITE_API_URL   || "http://localhost:5000";
const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || "AR-GLASSES-DEMO-001";

const getHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  "X-Device-Id":  DEVICE_ID,
  ...(tokenStorage.getToken()
    ? { Authorization: `Bearer ${tokenStorage.getToken()}` }
    : {}),
});

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const error: ApiErrorResponse = await res.json().catch(() => ({
      error:      "UNKNOWN",
      message:    `HTTP ${res.status}`,
      statusCode: res.status,
      timestamp:  new Date().toISOString(),
    }));
    throw new Error(error.message || "Erro inesperado.");
  }
  return res.json() as Promise<T>;
};

export const apiService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method:  "POST",
      headers: getHeaders(),
      body:    JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(res);
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<UserProfile>(res);
  },

  query: async (data: AssistantQueryDto): Promise<AssistantResponseDto> => {
    const res = await fetch(`${BASE_URL}/api/assistant/query`, {
      method:  "POST",
      headers: getHeaders(),
      body:    JSON.stringify({ ...data, deviceId: DEVICE_ID }),
    });
    return handleResponse<AssistantResponseDto>(res);
  },
};