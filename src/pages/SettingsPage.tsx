import { useEffect, useState } from "react";
import type { AppSettings } from "../../electron/core/settingsStore";
import type { HealthReport, UpdateCheckResult } from "../../electron/shared/types";
import type { UiLanguage } from "../i18n";
import { t } from "../i18n";

interface Props {
  lang: UiLanguage;
  settings: AppSettings;
  health: HealthReport | null;
  onSave: (next: Partial<AppSettings>) => Promise<void>;
}

function buildSupportDiagnosticsText(health: HealthReport | null): string {
  if (!health) {
    return "WirePN\n(health unavailable)";
  }
  const lines = [
    `WirePN ${health.appVersion}`,
    `Electron ${health.electronVersion}`,
    `Node ${health.nodeVersion}`,
    `OS ${health.osPlatform}`,
    `Runtime bin: ${health.runtimeBinDir}`,
    `User data: ${health.userDataPath}`,
    `Profiles: ${health.profileCount}`,
    `wireguard-go: ${health.runtimeBinary ? "ok" : "missing"}`,
    `Wintun: ${health.wintunBinary ? "ok" : "missing"}`,
    `Tunnel: ${health.status}`,
    health.lastError ? `Last error: ${health.lastError}` : null
  ].filter((x): x is string => Boolean(x));
  return lines.join("\n");
}

export function SettingsPage({ lang, settings, health, onSave }: Props) {
  const [draft, setDraft] = useState(settings);
  const [copied, setCopied] = useState(false);
  const [updateBusy, setUpdateBusy] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const themeLabel = (value: AppSettings["theme"]) =>
    value === "light" ? t(lang, "settings.theme.light") : value === "dark" ? t(lang, "settings.theme.dark") : t(lang, "settings.theme.system");
  const languageLabel = (value: AppSettings["language"]) => (value === "ru" ? t(lang, "settings.language.ru") : t(lang, "settings.language.en"));

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  return (
    <section className="page">
      <header className="page-header">
        <h2 className="page-title">{t(lang, "settings.title")}</h2>
        <p className="page-desc">{t(lang, "settings.desc")}</p>
      </header>

      <div className="card">
        <div className="toggle-list">
          <div className="toggle-row">
            <div className="toggle-text">
              <p className="toggle-title">{t(lang, "settings.startWithWindows")}</p>
              <p className="toggle-desc">{t(lang, "settings.startWithWindowsDesc")}</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={draft.startWithWindows}
                onChange={(e) => setDraft((v) => ({ ...v, startWithWindows: e.target.checked }))}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-text">
              <p className="toggle-title">{t(lang, "settings.autoReconnect")}</p>
              <p className="toggle-desc">{t(lang, "settings.autoReconnectDesc")}</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={draft.autoReconnect}
                onChange={(e) => setDraft((v) => ({ ...v, autoReconnect: e.target.checked }))}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-text">
              <p className="toggle-title">{t(lang, "settings.debug")}</p>
              <p className="toggle-desc">{t(lang, "settings.debugDesc")}</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={draft.debug}
                onChange={(e) => setDraft((v) => ({ ...v, debug: e.target.checked }))}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-text">
              <p className="toggle-title">{t(lang, "settings.theme")}</p>
              <p className="toggle-desc">{t(lang, "settings.themeDesc")}</p>
            </div>
            <select
              className="input"
              style={{ maxWidth: 180 }}
              value={draft.theme}
              onChange={(e) => setDraft((v) => ({ ...v, theme: e.target.value as AppSettings["theme"] }))}
            >
              <option value="light">{t(lang, "settings.theme.light")}</option>
              <option value="system">{t(lang, "settings.theme.system")}</option>
              <option value="dark">{t(lang, "settings.theme.dark")}</option>
            </select>
          </div>

          <div className="toggle-row">
            <div className="toggle-text">
              <p className="toggle-title">{t(lang, "settings.language")}</p>
              <p className="toggle-desc">{t(lang, "settings.languageDesc")}</p>
            </div>
            <select
              className="input"
              style={{ maxWidth: 180 }}
              value={draft.language}
              onChange={(e) => setDraft((v) => ({ ...v, language: e.target.value as AppSettings["language"] }))}
            >
              <option value="ru">{t(lang, "settings.language.ru")}</option>
              <option value="en">{t(lang, "settings.language.en")}</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <button type="button" className="btn btn-primary" onClick={() => void onSave(draft)}>
            {t(lang, "settings.save")}
          </button>
        </div>

        <p className="muted" style={{ marginTop: 16, marginBottom: 0 }}>
          {t(lang, "settings.currentValues")}: {t(lang, "settings.startWithWindows").toLowerCase()} —{" "}
          {settings.startWithWindows ? t(lang, "settings.yes") : t(lang, "settings.no")},{" "}
          {t(lang, "settings.autoReconnect").toLowerCase()} — {settings.autoReconnect ? t(lang, "settings.yes") : t(lang, "settings.no")},{" "}
          {t(lang, "settings.debug").toLowerCase()} — {settings.debug ? t(lang, "settings.yes") : t(lang, "settings.no")},{" "}
          {t(lang, "settings.theme").toLowerCase()} — {themeLabel(settings.theme)}, {t(lang, "settings.language").toLowerCase()} —{" "}
          {languageLabel(settings.language)}.
        </p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="card-title" style={{ marginBottom: 8 }}>
          {t(lang, "settings.updatesTitle")}
        </p>
        <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
          {t(lang, "settings.updatesDesc")}
        </p>
        <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
          {t(lang, "settings.updatesCurrent")}:{" "}
          <strong>{health?.appVersion?.trim() || "—"}</strong>
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={updateBusy}
            onClick={() => {
              setUpdateBusy(true);
              setUpdateResult(null);
              void window.wirepn
                .checkForUpdates()
                .then((r) => setUpdateResult(r))
                .finally(() => setUpdateBusy(false));
            }}
          >
            {updateBusy ? t(lang, "settings.updatesChecking") : t(lang, "settings.updatesCheck")}
          </button>
          {updateResult?.ok && updateResult.releaseUrl && updateResult.updateAvailable ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void window.wirepn.openExternal(updateResult.releaseUrl!)}
            >
              {t(lang, "settings.updatesDownload")}
            </button>
          ) : null}
        </div>
        {updateResult ? (
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            {!updateResult.ok ? (
              <>
                {t(lang, "settings.updatesError")}
                {updateResult.error ? `: ${updateResult.error}` : ""}
              </>
            ) : updateResult.updateAvailable ? (
              <>
                {t(lang, "settings.updatesAvailable")}: {updateResult.latestVersion ?? "—"}
              </>
            ) : (
              t(lang, "settings.updatesNone")
            )}
          </p>
        ) : null}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="card-title" style={{ marginBottom: 8 }}>
          {t(lang, "settings.diagnosticsTitle")}
        </p>
        <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
          {t(lang, "settings.diagnosticsDesc")}
        </p>
        {health !== null && !health.appVersion ? (
          <p className="muted text-danger" style={{ marginTop: 0, marginBottom: 12 }}>
            {t(lang, "settings.diagnosticsStaleHint")}
          </p>
        ) : null}
        <div className="health-grid">
          <div className="health-cell">
            <div className="health-label">WirePN</div>
            <div className="health-value">
              {health === null ? t(lang, "settings.diagnosticsLoading") : (health.appVersion || "—")}
            </div>
          </div>
          <div className="health-cell">
            <div className="health-label">Electron</div>
            <div className="health-value">
              {health === null ? t(lang, "settings.diagnosticsLoading") : (health.electronVersion || "—")}
            </div>
          </div>
          <div className="health-cell">
            <div className="health-label">Node</div>
            <div className="health-value">
              {health === null ? t(lang, "settings.diagnosticsLoading") : (health.nodeVersion || "—")}
            </div>
          </div>
          <div className="health-cell">
            <div className="health-label">OS</div>
            <div className="health-value">
              {health === null ? t(lang, "settings.diagnosticsLoading") : (health.osPlatform || "—")}
            </div>
          </div>
        </div>
        {health?.userDataPath ? (
          <p className="muted" style={{ marginTop: 12, marginBottom: 8, fontSize: 12, wordBreak: "break-all" }}>
            {health.userDataPath}
          </p>
        ) : null}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            void navigator.clipboard.writeText(buildSupportDiagnosticsText(health)).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? t(lang, "settings.copied") : t(lang, "settings.copySupportInfo")}
        </button>
      </div>
    </section>
  );
}
