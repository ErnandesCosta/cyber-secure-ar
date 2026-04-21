import { tokenStorage } from "../utils/tokenStorage";
import type { LoginRequest, LoginResponse, UserProfile } from "../types/auth";
import type { AssistantQueryDto, AssistantResponseDto } from "../types/query";
import type { ApiErrorResponse } from "../types/api";
import type {
  AuditIncidentDto,
  AuditSummaryDto,
  AuditTrendDto,
  SecurityAuditDto,
} from "../types/audit";
import type { AnomalyResultDto, BlockedDeviceDto } from "../types/security";
import type {
  BeginPasskeyRegistrationRequest,
  PasskeyAuthenticationOptions,
  PasskeyCredentialDto,
  PasskeyRegistrationOptions,
  PasskeyRegistrationResponse,
  VerifyPasskeyAuthenticationRequest,
} from "../types/passkey";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || "AR-GLASSES-DEMO-001";

const getHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  "X-Device-Id": DEVICE_ID,
  "X-Correlation-Id": crypto.randomUUID(),
  ...(tokenStorage.getToken()
    ? { Authorization: `Bearer ${tokenStorage.getToken()}` }
    : {}),
});

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const error: ApiErrorResponse = await res.json().catch(() => ({
      error: "UNKNOWN",
      message: `HTTP ${res.status}`,
      statusCode: res.status,
      timestamp: new Date().toISOString(),
    }));

    throw new Error(error.message || "Erro inesperado.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
};

export const apiService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse<LoginResponse>(res);
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, { headers: getHeaders() });
    return handleResponse<UserProfile>(res);
  },

  getPasskeys: async (): Promise<PasskeyCredentialDto[]> => {
    const res = await fetch(`${BASE_URL}/api/passkeys`, { headers: getHeaders() });
    return handleResponse<PasskeyCredentialDto[]>(res);
  },

  beginPasskeyRegistration: async (
    data: BeginPasskeyRegistrationRequest,
  ): Promise<PasskeyRegistrationOptions> => {
    const res = await fetch(`${BASE_URL}/api/passkeys/registration/options`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<PasskeyRegistrationOptions>(res);
  },

  finishPasskeyRegistration: async (
    data: PasskeyRegistrationResponse,
  ): Promise<PasskeyCredentialDto> => {
    const res = await fetch(`${BASE_URL}/api/passkeys/registration/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<PasskeyCredentialDto>(res);
  },

  beginPasskeyAuthentication: async (username: string): Promise<PasskeyAuthenticationOptions> => {
    const res = await fetch(`${BASE_URL}/api/passkeys/authentication/options`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ username }),
    });
    return handleResponse<PasskeyAuthenticationOptions>(res);
  },

  verifyPasskeyAuthentication: async (
    data: VerifyPasskeyAuthenticationRequest,
  ): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/api/passkeys/authentication/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(res);
  },

  deletePasskey: async (credentialId: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/passkeys/${credentialId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    await handleResponse<void>(res);
  },

  query: async (data: AssistantQueryDto): Promise<AssistantResponseDto> => {
    const res = await fetch(`${BASE_URL}/api/assistant/query`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ ...data, deviceId: DEVICE_ID }),
    });

    return handleResponse<AssistantResponseDto>(res);
  },

  getAuditEvents: async (): Promise<SecurityAuditDto[]> => {
    const res = await fetch(`${BASE_URL}/api/audit/events`, { headers: getHeaders() });
    return handleResponse<SecurityAuditDto[]>(res);
  },

  getAuditSummary: async (): Promise<AuditSummaryDto> => {
    const res = await fetch(`${BASE_URL}/api/audit/summary`, { headers: getHeaders() });
    return handleResponse<AuditSummaryDto>(res);
  },

  getAuditTrends: async (): Promise<AuditTrendDto[]> => {
    const res = await fetch(`${BASE_URL}/api/audit/trends`, { headers: getHeaders() });
    return handleResponse<AuditTrendDto[]>(res);
  },

  getAuditIncidents: async (): Promise<AuditIncidentDto[]> => {
    const res = await fetch(`${BASE_URL}/api/audit/incidents`, { headers: getHeaders() });
    return handleResponse<AuditIncidentDto[]>(res);
  },

  getBlockedDevices: async (): Promise<BlockedDeviceDto[]> => {
    const res = await fetch(`${BASE_URL}/api/security/blocked-devices`, {
      headers: getHeaders(),
    });
    return handleResponse<BlockedDeviceDto[]>(res);
  },

  unblockDevice: async (deviceId: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/security/blocked-devices/${deviceId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    await handleResponse<void>(res);
  },

  checkAnomaly: async (deviceId: string): Promise<AnomalyResultDto> => {
    const res = await fetch(`${BASE_URL}/api/security/anomalies/${deviceId}`, {
      headers: getHeaders(),
    });

    return handleResponse<AnomalyResultDto>(res);
  },
};
