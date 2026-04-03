import { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, shell } from "electron";
import { existsSync } from "node:fs";
import { join } from "node:path";

if (process.platform === "win32") {
  app.setAppUserModelId("ru.wirepn.client");
}

const resolveUnderBuild = (...name: string[]): string => {
  const fromApp = join(app.getAppPath(), "build", ...name);
  if (existsSync(fromApp)) {
    return fromApp;
  }
  return join(process.cwd(), "build", ...name);
};

const getAppIconPath = (): string | undefined => {
  const p = resolveUnderBuild("icon.ico");
  return existsSync(p) ? p : undefined;
};

const getTrayImage = (): Electron.NativeImage => {
  const trayPng = resolveUnderBuild("tray.png");
  if (existsSync(trayPng)) {
    return nativeImage.createFromPath(trayPng);
  }
  const ico = resolveUnderBuild("icon.ico");
  if (existsSync(ico)) {
    return nativeImage.createFromPath(ico);
  }
  return nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAoMBgLxJzUQAAAAASUVORK5CYII="
  );
};
import { importConfSchema } from "../shared/schemas";
import { LogStore } from "../core/logStore";
import { ProfileStore } from "../core/profileStore";
import { RuntimeManager, getRuntimePaths } from "../core/runtimeManager";
import { SettingsStore } from "../core/settingsStore";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const logs = new LogStore();
const profiles = new ProfileStore();
const settings = new SettingsStore();
const runtime = new RuntimeManager(profiles, logs, settings);
runtime.onStateChange((state) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.webContents.send("runtime:state-changed", state);
});

const trayLabel = (language: "ru" | "en", key: "show" | "connect" | "disconnect" | "quit"): string => {
  const ru = { show: "Показать WirePN", connect: "Подключить", disconnect: "Отключить", quit: "Выход" };
  const en = { show: "Show WirePN", connect: "Connect", disconnect: "Disconnect", quit: "Quit" };
  return language === "ru" ? ru[key] : en[key];
};

const createWindow = async (): Promise<void> => {
  const icon = getAppIconPath();
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    ...(icon ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    // Production bundle: electron-vite outputs the renderer to out/renderer (not dist/)
    await mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:")) {
      void shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "deny" };
  });

  mainWindow.on("close", (event) => {
    if (isQuitting) {
      return;
    }
    event.preventDefault();
    mainWindow?.hide();
  });
};

const refreshTrayMenu = (): void => {
  if (!tray) {
    return;
  }
  const cfg = settings.get();
  const menu = Menu.buildFromTemplate([
    {
      label: trayLabel(cfg.language, "show"),
      click: () => {
        if (!mainWindow) {
          return;
        }
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: trayLabel(cfg.language, "connect"),
      click: () => {
        void runtime.connect();
      }
    },
    {
      label: trayLabel(cfg.language, "disconnect"),
      click: () => {
        void runtime.disconnect();
      }
    },
    { type: "separator" },
    {
      label: trayLabel(cfg.language, "quit"),
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(menu);
};

const createTray = (): void => {
  tray = new Tray(getTrayImage());
  tray.setToolTip("WirePN");
  refreshTrayMenu();
  tray.on("double-click", () => {
    if (!mainWindow) {
      return;
    }
    mainWindow.show();
    mainWindow.focus();
  });
};

const registerIpc = (): void => {
  ipcMain.handle("runtime:get-state", async () => runtime.getState());
  ipcMain.handle("runtime:connect", async (_, profileId?: string) => runtime.connect(profileId));
  ipcMain.handle("runtime:disconnect", async () => runtime.disconnect());
  ipcMain.handle("runtime:health", async () => runtime.health());
  ipcMain.handle("runtime:paths", async () => getRuntimePaths());

  ipcMain.handle("profiles:list", async () => profiles.list());
  ipcMain.handle("profiles:import", async (_, payload: unknown) => {
    const data = importConfSchema.parse(payload);
    return profiles.importConf(data.name, data.conf);
  });
  ipcMain.handle("profiles:set-active", async (_, profileId: string) => profiles.setActiveProfile(profileId));
  ipcMain.handle("profiles:set-mode", async (_, payload: { profileId: string; mode: "full" | "split-routes" }) =>
    profiles.setProfileMode(payload.profileId, payload.mode)
  );
  ipcMain.handle("profiles:remove", async (_, profileId: string) => profiles.remove(profileId));

  ipcMain.handle("logs:list", async () => logs.list());
  ipcMain.handle("settings:get", async () => settings.get());
  ipcMain.handle("settings:set", async (_, next) => {
    const updated = settings.set(next);
    app.setLoginItemSettings({ openAtLogin: updated.startWithWindows });
    refreshTrayMenu();
    return updated;
  });
};

app.whenReady().then(async () => {
  registerIpc();
  await createWindow();
  createTray();

  const cfg = settings.get();
  if (cfg.autoReconnect && profiles.getActiveProfile()) {
    runtime.connect().catch((e: unknown) => {
      logs.push("error", `autoconnect failed: ${String(e)}`);
    });
  }

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && isQuitting) {
    app.quit();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
});
