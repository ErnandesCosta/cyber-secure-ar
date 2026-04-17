export interface AuditActionMetric {
  action: string;
  count: number;
}

export interface AuditSummary {
  totalEvents: number;
  allowedEvents: number;
  blockedEvents: number;
  riskScore: number;
  topActions: AuditActionMetric[];
}
