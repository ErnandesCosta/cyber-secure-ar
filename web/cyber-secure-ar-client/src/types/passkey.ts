import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";

export interface PasskeyCredentialDto {
  credentialId: string;
  label: string;
  signatureCounter: number;
  transports: string[];
  isBackupEligible: boolean;
  isBackedUp: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface BeginPasskeyRegistrationRequest {
  label?: string;
}

export interface VerifyPasskeyAuthenticationRequest {
  username: string;
  response: AuthenticationResponseJSON;
}

export type PasskeyRegistrationOptions = PublicKeyCredentialCreationOptionsJSON;
export type PasskeyAuthenticationOptions = PublicKeyCredentialRequestOptionsJSON;
export type PasskeyRegistrationResponse = RegistrationResponseJSON;
