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
  /** From `app.getVersion()` — same as packaged installer semver. */
  appVersion: string;
  electronVersion: string;
  nodeVersion: string;
  /** e.g. `win32 x64` */
  osPlatform: string;
  runtimeBinDir: string;
  userDataPath: string;
}

/** WireGuard UAPI peer transfer + handshake (from `get` on the interface). */
export interface TunnelStats {
  rxBytes: number;
  txBytes: number;
  /** Unix seconds; 0 = no handshake yet */
  lastHandshakeSec: number;
  /** When we transitioned to connected (client-side). */
  connectedSinceIso?: string;
}

export interface PingResult {
  ok: boolean;
  host: string;
  ms?: number;
  error?: string;
}
