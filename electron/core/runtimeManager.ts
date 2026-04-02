import { app } from "electron";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import type { HealthReport, RuntimeState, VpnProfile } from "../shared/types";
import { LogStore } from "./logStore";
import { ProfileStore } from "./profileStore";
import { SettingsStore } from "./settingsStore";
import {
  WG_TUN_INTERFACE_NAME,
  WINTUN_ADMIN_REQUIRED_MESSAGE,
  buildUapiSetBody,
  isWintunAccessDenied,
  uapiSet,
  waitForWireGuardUapiPipeWhileProcessRuns
} from "./wireguardUapi";
import { cleanupWireGuardTunnelWindows, configureWireGuardTunnelWindows } from "./windowsTunnel";

export const getRuntimeBinDir = (): string => {
  const base = app.isPackaged ? process.resourcesPath : app.getAppPath();
  return join(base, "runtime", "bin");
};

export interface RuntimePaths {
  binDir: string;
  wireguardGo: string;
  wintunDll: string;
}

export const getRuntimePaths = (): RuntimePaths => {
  const binDir = getRuntimeBinDir();
  return {
    binDir,
    wireguardGo: join(binDir, "wireguard-go.exe"),
    wintunDll: join(binDir, "wintun.dll")
  };
};

const renderConf = (profile: VpnProfile, privateKey: string): string => {
  const dnsLine = profile.dns ? `DNS = ${profile.dns}\n` : "";
  return `[Interface]\nPrivateKey = ${privateKey}\nAddress = ${profile.address}\n${dnsLine}\n[Peer]\nPublicKey = ${profile.publicKey}\nEndpoint = ${profile.endpoint}\nAllowedIPs = ${profile.allowedIps}\n`;
};

const POST_CONNECT_CHECK_URLS = [
  "https://connectivitycheck.gstatic.com/generate_204",
  "https://www.msftconnecttest.com/connecttest.txt"
] as const;

const MAX_AUTORECONNECT_ATTEMPTS = 30;

export class RuntimeManager {
  private proc?: ChildProcessWithoutNullStreams;
  private stopping = false;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private reconnectAttempts = 0;
  private readonly stateListeners = new Set<(state: RuntimeState) => void>();
  private state: RuntimeState = {
    status: "disconnected",
    updatedAt: new Date().toISOString()
  };

  constructor(
    private readonly profileStore: ProfileStore,
    private readonly logs: LogStore,
    private readonly settings: SettingsStore
  ) {}

  getState(): RuntimeState {
    return { ...this.state };
  }

  onStateChange(listener: (state: RuntimeState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private updateState(next: Partial<RuntimeState>): RuntimeState {
    this.state = { ...this.state, ...next, updatedAt: new Date().toISOString() };
    const snapshot = this.getState();
    for (const listener of this.stateListeners) {
      try {
        listener(snapshot);
      } catch {
        /* ignore listener error */
      }
    }
    return snapshot;
  }

  private clearReconnectSchedule(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.reconnectAttempts = 0;
  }

  private scheduleReconnectAfterDrop(profileId: string): void {
    if (!this.settings.get().autoReconnect) {
      return;
    }
    if (this.reconnectAttempts >= MAX_AUTORECONNECT_ATTEMPTS) {
      this.logs.push("warn", `autoreconnect: stopped after ${MAX_AUTORECONNECT_ATTEMPTS} attempts`);
      this.clearReconnectSchedule();
      return;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectAttempts += 1;
    const delayMs = Math.min(2000 * Math.pow(2, this.reconnectAttempts - 1), 60_000);
    this.logs.push(
      "info",
      `autoreconnect in ${Math.round(delayMs / 1000)}s (attempt ${this.reconnectAttempts}/${MAX_AUTORECONNECT_ATTEMPTS})`
    );
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      if (this.proc) {
        return;
      }
      void this.connect(profileId, { fromAutoReconnect: true }).then((state) => {
        if (state.status === "connected") {
          this.reconnectAttempts = 0;
        } else if (
          state.status === "error" &&
          this.settings.get().autoReconnect &&
          this.reconnectAttempts < MAX_AUTORECONNECT_ATTEMPTS
        ) {
          this.scheduleReconnectAfterDrop(profileId);
        }
      });
    }, delayMs);
  }

  private async verifyPostConnectInternet(): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 600));
    for (const url of POST_CONNECT_CHECK_URLS) {
      try {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, { method: "GET", signal: ctrl.signal, cache: "no-store" });
        clearTimeout(id);
        if (res.ok || res.status === 204) {
          return true;
        }
      } catch {
        /* try next */
      }
    }
    return false;
  }

  async connect(profileId?: string, opts?: { fromAutoReconnect?: boolean }): Promise<RuntimeState> {
    if (!opts?.fromAutoReconnect) {
      this.clearReconnectSchedule();
    }

    if (this.proc) {
      return this.updateState({ status: "connected", message: "Already connected" });
    }

    const profile = profileId
      ? this.profileStore.list().find((p) => p.id === profileId)
      : this.profileStore.getActiveProfile();
    if (!profile) {
      throw new Error("No profile selected");
    }

    const paths = getRuntimePaths();
    if (!existsSync(paths.wireguardGo)) {
      throw new Error(
        `Нет wireguard-go.exe. Положите файл сюда:\n${paths.wireguardGo}\n\nСм. runtime/bin/README.txt`
      );
    }
    if (!existsSync(paths.wintunDll)) {
      throw new Error(
        `Нет wintun.dll. Положите файл сюда:\n${paths.wintunDll}\n\nСм. https://www.wintun.net/`
      );
    }

    this.updateState({ status: "connecting", profileId: profile.id, message: "Starting runtime" });

    const confDir = join(app.getPath("userData"), "wirepn", "runtime");
    mkdirSync(confDir, { recursive: true });
    const confPath = join(confDir, `${profile.id}.conf`);
    const priv = this.profileStore.decrypt(profile.privateKeyEncrypted);
    writeFileSync(confPath, renderConf(profile, priv), "utf-8");

    this.proc = spawn(paths.wireguardGo, [WG_TUN_INTERFACE_NAME], {
      windowsHide: true,
      cwd: paths.binDir
    });

    const stderrAcc = { text: "" };

    this.proc.stdout.on("data", (chunk) => {
      this.logs.push("info", String(chunk).trim());
    });
    this.proc.stderr.on("data", (chunk) => {
      stderrAcc.text += String(chunk);
      const text = String(chunk).trim();
      if (text) {
        this.logs.push("warn", text);
      }
    });

    this.proc.once("exit", (code, signal) => {
      const exitMsg =
        code !== null ? `runtime exited with code ${code}` : `runtime exited by signal ${signal ?? "unknown"}`;
      this.logs.push(this.stopping ? "info" : "warn", exitMsg);
      this.proc = undefined;
      const wasStopping = this.stopping;
      this.stopping = false;
      if (this.state.status !== "connected") {
        return;
      }
      const droppedProfileId = this.state.profileId;
      const msg = isWintunAccessDenied(stderrAcc.text)
        ? WINTUN_ADMIN_REQUIRED_MESSAGE
        : `Exited: ${code ?? "unknown"}`;
      this.updateState({ status: "disconnected", message: msg });
      if (!wasStopping && droppedProfileId && this.settings.get().autoReconnect) {
        this.scheduleReconnectAfterDrop(droppedProfileId);
      }
    });

    try {
      const uapiPipePath = await waitForWireGuardUapiPipeWhileProcessRuns(
        WG_TUN_INTERFACE_NAME,
        this.proc,
        stderrAcc
      );
      const setBody = buildUapiSetBody(priv, profile.publicKey, profile.endpoint, profile.allowedIps);
      await uapiSet(uapiPipePath, setBody);
      const routeDiag = await configureWireGuardTunnelWindows(WG_TUN_INTERFACE_NAME, profile);
      if (routeDiag) {
        this.logs.push("info", routeDiag);
      }
    } catch (e) {
      if (this.proc) {
        this.proc.kill();
        this.proc = undefined;
      }
      const msg = e instanceof Error ? e.message : String(e);
      this.logs.push("error", `runtime setup failed: ${msg}`);
      return this.updateState({ status: "error", profileId: profile.id, message: msg });
    }

    this.logs.push("info", `connected profile ${profile.name}`);

    const internetOk = await this.verifyPostConnectInternet();
    if (internetOk) {
      this.logs.push("info", "post-connect check: internet reachable");
    } else {
      this.logs.push("warn", "post-connect check: could not verify internet reachability");
    }

    this.reconnectAttempts = 0;
    return this.updateState({
      status: "connected",
      profileId: profile.id,
      message: internetOk ? "Tunnel connected" : "Tunnel connected (internet check unclear)"
    });
  }

  async disconnect(): Promise<RuntimeState> {
    this.clearReconnectSchedule();
    if (!this.proc) {
      return this.updateState({ status: "disconnected", message: "Already disconnected" });
    }
    const activeProfile = this.profileStore.list().find((p) => p.id === this.state.profileId);
    const cleanupOut = await cleanupWireGuardTunnelWindows(WG_TUN_INTERFACE_NAME, activeProfile);
    if (cleanupOut) {
      this.logs.push("info", cleanupOut);
    }
    this.stopping = true;
    this.proc.kill();
    this.proc = undefined;
    this.logs.push("info", "tunnel disconnected by user");
    return this.updateState({ status: "disconnected", message: "Tunnel disconnected" });
  }

  health(): HealthReport {
    const paths = getRuntimePaths();
    return {
      runtimeBinary: existsSync(paths.wireguardGo),
      wintunBinary: existsSync(paths.wintunDll),
      profileCount: this.profileStore.list().length,
      status: this.state.status,
      lastError: this.state.status === "error" ? this.state.message : undefined
    };
  }
}
