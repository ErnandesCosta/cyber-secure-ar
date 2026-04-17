export interface SecurityAuditEvent {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  wasAllowed: boolean;
  blockReason?: string | null;
  ipAddress: string;
  deviceId: string;
  occurredAt: string;
}
