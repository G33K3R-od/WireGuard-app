import type { AppSettings } from "../core/settingsStore";
import type { RuntimePaths } from "../core/runtimeManager";
import type { HealthReport, LogEntry, RuntimeState, VpnProfile } from "../shared/types";

export interface WirepnApi {
  getState: () => Promise<RuntimeState>;
  connect: (profileId?: string) => Promise<RuntimeState>;
  disconnect: () => Promise<RuntimeState>;
  health: () => Promise<HealthReport>;
  getRuntimePaths: () => Promise<RuntimePaths>;
  listProfiles: () => Promise<VpnProfile[]>;
  importProfile: (name: string, conf: string) => Promise<VpnProfile>;
  setActiveProfile: (profileId: string) => Promise<VpnProfile>;
  setProfileMode: (profileId: string, mode: "full" | "split-routes") => Promise<VpnProfile>;
  removeProfile: (profileId: string) => Promise<void>;
  getLogs: () => Promise<LogEntry[]>;
  getSettings: () => Promise<AppSettings>;
  setSettings: (next: Partial<AppSettings>) => Promise<AppSettings>;
  onRuntimeStateChanged: (handler: (state: RuntimeState) => void) => () => void;
}

declare global {
  interface Window {
    wirepn: WirepnApi;
  }
}
