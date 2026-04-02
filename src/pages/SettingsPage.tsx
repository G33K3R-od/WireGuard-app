import { useEffect, useState } from "react";
import type { AppSettings } from "../../electron/core/settingsStore";
import type { UiLanguage } from "../i18n";
import { t } from "../i18n";

interface Props {
  lang: UiLanguage;
  settings: AppSettings;
  onSave: (next: Partial<AppSettings>) => Promise<void>;
}

export function SettingsPage({ lang, settings, onSave }: Props) {
  const [draft, setDraft] = useState(settings);
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
    </section>
  );
}
