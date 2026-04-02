export type TunnelStatus = "disconnected" | "connecting" | "connected" | "error";

export type ProfileMode = "full" | "split-routes";

export interface VpnProfile {
  id: string;
  name: string;
  endpoint: string;
  address: string;
  dns?: string;
  allowedIps: string;
  mode: ProfileMode;
  publicKey: string;
  privateKeyEncrypted: string;
  createdAt: string;
}

export interface RuntimeState {
  status: TunnelStatus;
  profileId?: string;
  message?: string;
  updatedAt: string;
}

export interface LogEntry {
  level: "info" | "warn" | "error";
  ts: string;
  message: string;
}

export interface HealthReport {
  runtimeBinary: boolean;
  wintunBinary: boolean;
  profileCount: number;
  status: TunnelStatus;
  lastError?: string;
}
