import type { WirepnApi } from "../electron/shared/ipc";

declare global {
  interface Window {
    wirepn: WirepnApi;
  }
}

export {};
