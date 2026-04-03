import { contextBridge, ipcRenderer } from "electron";
import type { WirepnApi } from "../shared/ipc";

const api: WirepnApi = {
  getState: () => ipcRenderer.invoke("runtime:get-state"),
  connect: (profileId?: string) => ipcRenderer.invoke("runtime:connect", profileId),
  disconnect: () => ipcRenderer.invoke("runtime:disconnect"),
  health: () => ipcRenderer.invoke("runtime:health"),
  getTunnelStats: () => ipcRenderer.invoke("runtime:get-stats"),
  pingEndpoint: (profileId?: string) => ipcRenderer.invoke("runtime:ping", profileId),
  getRuntimePaths: () => ipcRenderer.invoke("runtime:paths"),
  listProfiles: () => ipcRenderer.invoke("profiles:list"),
  importProfile: (name: string, conf: string) => ipcRenderer.invoke("profiles:import", { name, conf }),
  exportProfile: (profileId: string) => ipcRenderer.invoke("profiles:export", profileId),
  setActiveProfile: (profileId: string) => ipcRenderer.invoke("profiles:set-active", profileId),
  setProfileMode: (profileId, mode) => ipcRenderer.invoke("profiles:set-mode", { profileId, mode }),
  removeProfile: (profileId: string) => ipcRenderer.invoke("profiles:remove", profileId),
  getLogs: () => ipcRenderer.invoke("logs:list"),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setSettings: (next) => ipcRenderer.invoke("settings:set", next),
  onRuntimeStateChanged: (handler) => {
    const channel = "runtime:state-changed";
    const wrapped = (_event: Electron.IpcRendererEvent, state: Awaited<ReturnType<WirepnApi["getState"]>>) => {
      handler(state);
    };
    ipcRenderer.on(channel, wrapped);
    return () => {
      ipcRenderer.removeListener(channel, wrapped);
    };
  }
};

contextBridge.exposeInMainWorld("wirepn", api);
