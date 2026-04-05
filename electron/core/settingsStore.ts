import { app } from "electron";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface AppSettings {
  startWithWindows: boolean;
  autoReconnect: boolean;
  theme: "light" | "system" | "dark";
  language: "ru" | "en";
  debug: boolean;
  /** First-launch welcome; omitted in old `settings.json` → treated as already seen (migration). */
  onboardingDone: boolean;
}

const DEFAULTS: AppSettings = {
  startWithWindows: false,
  autoReconnect: true,
  theme: "light",
  language: "ru",
  debug: false,
  onboardingDone: false
};

export class SettingsStore {
  private readonly filePath: string;
  private value: AppSettings = { ...DEFAULTS };

  constructor() {
    const dir = join(app.getPath("userData"), "wirepn");
    mkdirSync(dir, { recursive: true });
    this.filePath = join(dir, "settings.json");
    this.load();
  }

  private load(): void {
    if (!existsSync(this.filePath)) {
      this.value = { ...DEFAULTS };
      this.save();
      return;
    }
    const raw = JSON.parse(readFileSync(this.filePath, "utf-8")) as Record<string, unknown>;
    this.value = { ...DEFAULTS, ...raw } as AppSettings;
    if (!("onboardingDone" in raw)) {
      this.value.onboardingDone = true;
    }
  }

  private save(): void {
    writeFileSync(this.filePath, JSON.stringify(this.value, null, 2), "utf-8");
  }

  get(): AppSettings {
    return { ...this.value };
  }

  set(next: Partial<AppSettings>): AppSettings {
    this.value = { ...this.value, ...next };
    this.save();
    return this.get();
  }
}
