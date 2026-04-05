import { useEffect, useMemo, useState } from "react";
import type { AppSettings } from "../electron/core/settingsStore";
import type { RuntimePaths } from "../electron/core/runtimeManager";
import type { HealthReport, LogEntry, RuntimeState, VpnProfile } from "../electron/shared/types";
import { OnboardingModal } from "./components/OnboardingModal";
import { ConnectPage } from "./pages/ConnectPage";
import { ProfilesPage } from "./pages/ProfilesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LogsPage } from "./pages/LogsPage";
import { mapRuntimeError, statusText, t } from "./i18n";

type TabId = "connect" | "profiles" | "settings" | "logs";

function IconPlug() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 22v-5M9 8V2h6v6M5 12H2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3M19 12h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3M9 8a3 3 0 1 0 6 0" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function IconScroll() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function App() {
  const [tab, setTab] = useState<TabId>("connect");
  const [state, setState] = useState<RuntimeState | null>(null);
  const [profiles, setProfiles] = useState<VpnProfile[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    startWithWindows: false,
    autoReconnect: true,
    theme: "light",
    language: "ru",
    debug: false,
    onboardingDone: true
  });
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [runtimePaths, setRuntimePaths] = useState<RuntimePaths | null>(null);
  const [error, setError] = useState<string>("");

  const refreshRuntimeSnapshot = async () => {
    try {
      const [nextState, nextLogs, nextHealth] = await Promise.all([
        window.wirepn.getState(),
        window.wirepn.getLogs(),
        window.wirepn.health()
      ]);
      setState(nextState);
      setLogs(nextLogs);
      setHealth(nextHealth);
      setError("");
    } catch (e) {
      setError(mapRuntimeError(lang, e));
      try {
        setHealth(await window.wirepn.health());
      } catch {
        /* still no health — UI shows loading / dashes */
      }
    }
  };

  const refreshAll = async () => {
    try {
      const [nextState, nextProfiles, nextLogs, nextSettings, nextHealth, nextPaths] = await Promise.all([
        window.wirepn.getState(),
        window.wirepn.listProfiles(),
        window.wirepn.getLogs(),
        window.wirepn.getSettings(),
        window.wirepn.health(),
        window.wirepn.getRuntimePaths()
      ]);
      setState(nextState);
      setProfiles(nextProfiles);
      setLogs(nextLogs);
      setSettings(nextSettings);
      setHealth(nextHealth);
      setRuntimePaths(nextPaths);
      setError("");
    } catch (e) {
      setError(mapRuntimeError(lang, e));
      try {
        setHealth(await window.wirepn.health());
      } catch {
        /* ignore */
      }
      try {
        setRuntimePaths(await window.wirepn.getRuntimePaths());
      } catch {
        /* ignore */
      }
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    const unsubscribe = window.wirepn.onRuntimeStateChanged((nextState) => {
      setState(nextState);
      void refreshRuntimeSnapshot();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (tab !== "connect") {
      return;
    }
    void refreshRuntimeSnapshot();
    const timer = window.setInterval(() => {
      void refreshRuntimeSnapshot();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [tab]);

  useEffect(() => {
    const onFocus = () => {
      void refreshRuntimeSnapshot();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const activeProfile = useMemo(() => profiles.find((p) => p.id === state?.profileId) ?? profiles[0], [profiles, state?.profileId]);
  const status = state?.status ?? "disconnected";
  const lang = settings.language;

  useEffect(() => {
    const html = document.documentElement;
    const applyTheme = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const effectiveTheme = settings.theme === "system" ? (isDark ? "dark" : "light") : settings.theme;
      html.setAttribute("data-theme", effectiveTheme);
    };
    applyTheme();
    const mm = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (settings.theme === "system") {
        applyTheme();
      }
    };
    mm.addEventListener("change", onChange);
    return () => mm.removeEventListener("change", onChange);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  useEffect(() => {
    if (!settings.debug && tab === "logs") {
      setTab("connect");
    }
  }, [settings.debug, tab]);

  useEffect(() => {
    if (tab === "settings") {
      void refreshRuntimeSnapshot();
    }
  }, [tab]);

  return (
    <div className="app-shell">
      {!settings.onboardingDone ? (
        <OnboardingModal
          lang={lang}
          onDismiss={async () => {
            const updated = await window.wirepn.setSettings({ onboardingDone: true });
            setSettings(updated);
          }}
        />
      ) : null}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">WP</div>
          <div>
            <h1 className="sidebar-title">WirePN</h1>
            <p className="sidebar-sub">{t(lang, "app.subtitle")}</p>
          </div>
        </div>

        <nav className="nav" aria-label={t(lang, "common.sections")}>
          <button type="button" className={tab === "connect" ? "nav-item active" : "nav-item"} onClick={() => setTab("connect")}>
            <IconPlug />
            <span>{t(lang, "nav.connect")}</span>
          </button>
          <button type="button" className={tab === "profiles" ? "nav-item active" : "nav-item"} onClick={() => setTab("profiles")}>
            <IconUsers />
            <span>{t(lang, "nav.profiles")}</span>
          </button>
          <button type="button" className={tab === "settings" ? "nav-item active" : "nav-item"} onClick={() => setTab("settings")}>
            <IconSettings />
            <span>{t(lang, "nav.settings")}</span>
          </button>
          {settings.debug ? (
            <button type="button" className={tab === "logs" ? "nav-item active" : "nav-item"} onClick={() => setTab("logs")}>
              <IconScroll />
              <span>{t(lang, "nav.logs")}</span>
            </button>
          ) : null}
        </nav>

        <div className="sidebar-footer">
          <span className={`badge badge-${status}`}>
            <span className="badge-dot" aria-hidden />
            {statusText(lang, status)}
          </span>
          <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={refreshAll}>
            <IconRefresh />
            {t(lang, "common.refresh")}
          </button>
        </div>
      </aside>

      <main className="main-content">
        {error ? <div className="banner-error">{error}</div> : null}

        {tab === "connect" ? (
          <ConnectPage
            lang={lang}
            showDebug={settings.debug}
            state={state}
            profile={activeProfile}
            health={health}
            runtimePaths={runtimePaths}
            onConnect={async (profileId) => {
              try {
                setState((prev) => ({
                  status: "connecting",
                  profileId: profileId ?? prev?.profileId ?? activeProfile?.id,
                  message: "Starting runtime",
                  updatedAt: new Date().toISOString()
                }));
                const next = await window.wirepn.connect(profileId);
                setState(next);
                await refreshAll();
              } catch (e) {
                setError(mapRuntimeError(lang, e));
              }
            }}
            onDisconnect={async () => {
              try {
                setState((prev) => ({
                  status: "disconnected",
                  profileId: prev?.profileId,
                  message: "Tunnel disconnected",
                  updatedAt: new Date().toISOString()
                }));
                const next = await window.wirepn.disconnect();
                setState(next);
                await refreshAll();
              } catch (e) {
                setError(mapRuntimeError(lang, e));
              }
            }}
          />
        ) : null}

        {tab === "profiles" ? (
          <ProfilesPage
            lang={lang}
            profiles={profiles}
            activeProfileId={activeProfile?.id}
            onImport={async (name, conf) => {
              await window.wirepn.importProfile(name, conf);
              await refreshAll();
            }}
            onSetActive={async (id) => {
              await window.wirepn.setActiveProfile(id);
              await refreshAll();
            }}
            onSetMode={async (id, mode) => {
              await window.wirepn.setProfileMode(id, mode);
              await refreshAll();
            }}
            onRemove={async (id) => {
              await window.wirepn.removeProfile(id);
              await refreshAll();
            }}
          />
        ) : null}

        {tab === "settings" ? (
          <SettingsPage
            lang={lang}
            settings={settings}
            health={health}
            onSave={async (next) => {
              const updated = await window.wirepn.setSettings(next);
              setSettings(updated);
            }}
          />
        ) : null}

        {settings.debug && tab === "logs" ? <LogsPage lang={lang} entries={logs} /> : null}
      </main>
    </div>
  );
}
