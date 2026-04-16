export interface LoginRequest {
  username: string;
  password: string;
  deviceId: string;
}

export interface LoginResponse {
  token: string;
  fullName: string;
  role: string;
  department: string;
  expiresAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  department: string;
  role: "Technician" | "Specialist" | "Manager";
}