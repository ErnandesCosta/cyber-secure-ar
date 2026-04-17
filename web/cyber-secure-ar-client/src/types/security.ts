export interface BlockedDeviceDto {
  id:        string;
  deviceId:  string;
  reason:    string;
  riskScore: number;
  blockedAt: string;
}

export interface AnomalyResultDto {
  deviceId:     string;
  isAnomaly:    boolean;
  anomalyScore: number;
  reason:       string;
  checkedAt:    string;
}
