export interface SecurityAuditDto {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  wasAllowed: boolean;
  blockReason: string | null;
  ipAddress: string;
  deviceId: string;
  correlationId: string;
  occurredAt: string;
}

export interface AuditSummaryDto {
  totalEvents: number;
  allowedEvents: number;
  blockedEvents: number;
  riskScore: number;
  topActions: AuditActionMetricDto[];
}

export interface AuditActionMetricDto {
  action: string;
  count: number;
}

export interface AuditTrendDto {
  label: string;
  riskScore: number;
}

export interface AuditIncidentDto {
  correlationId: string;
  userId: string | null;
  deviceId: string;
  resource: string;
  totalEvents: number;
  blockedEvents: number;
  severity: number;
  lastOccurredAt: string;
}
