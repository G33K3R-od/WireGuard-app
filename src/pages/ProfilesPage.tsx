import { useRef, useState } from "react";
import type { ProfileMode, VpnProfile } from "../../electron/shared/types";
import type { UiLanguage } from "../i18n";
import { mapWirepnImportError, t } from "../i18n";

interface Props {
  lang: UiLanguage;
  profiles: VpnProfile[];
  activeProfileId?: string;
  onImport: (name: string, conf: string) => Promise<void>;
  onSetActive: (profileId: string) => Promise<void>;
  onSetMode: (profileId: string, mode: ProfileMode) => Promise<void>;
  onRemove: (profileId: string) => Promise<void>;
}

const modeLabel = (lang: UiLanguage): Record<ProfileMode, string> => ({
  full: t(lang, "profiles.mode.full"),
  "split-routes": t(lang, "profiles.mode.split")
});

const INVALID_WIN_FILE_CHARS = new Set('<>:"/\\|?*'.split(""));

const safeFileName = (name: string): string =>
  [...name]
    .map((ch) => {
      const c = ch.charCodeAt(0);
      if (c < 32) {
        return "_";
      }
      return INVALID_WIN_FILE_CHARS.has(ch) ? "_" : ch;
    })
    .join("")
    .trim() || "profile";

export function ProfilesPage({ lang, profiles, activeProfileId, onImport, onSetActive, onSetMode, onRemove }: Props) {
  const [name, setName] = useState("");
  const [conf, setConf] = useState("");
  const [importError, setImportError] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [exportError, setExportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    const nextName = name.trim();
    const nextConf = conf.trim();
    if (!nextName) {
      setImportError(t(lang, "profiles.importNoName"));
      return;
    }
    if (nextConf.length < 20) {
      setImportError(t(lang, "profiles.importShortConf"));
      return;
    }
    setImportBusy(true);
    setImportError("");
    setExportError("");
    try {
      await onImport(nextName, nextConf);
      setName("");
      setConf("");
    } catch (e) {
      setImportError(mapWirepnImportError(lang, e));
    } finally {
      setImportBusy(false);
    }
  };

  const onPickConfFile = () => {
    setExportError("");
    fileInputRef.current?.click();
  };

  const onConfFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setConf(reader.result);
        setImportError("");
      }
    };
    reader.readAsText(file);
  };

  const handleExport = async (p: VpnProfile) => {
    setExportError("");
    try {
      const text = await window.wirepn.exportProfile(p.id);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeFileName(p.name)}.conf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(`${t(lang, "profiles.exportFailed")}: ${String(e)}`);
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <h2 className="page-title">{t(lang, "profiles.title")}</h2>
        <p className="page-desc">{t(lang, "profiles.desc")}</p>
      </header>

      <div className="stack">
        <div className="card">
          <p className="card-title" style={{ marginBottom: 16 }}>
            {t(lang, "profiles.newProfile")}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".conf,.config,text/plain"
            style={{ display: "none" }}
            onChange={onConfFileSelected}
          />
          <div className="field">
            <label className="label" htmlFor="profile-name">
              {t(lang, "profiles.name")}
            </label>
            <input
              id="profile-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(lang, "profiles.namePlaceholder")}
              autoComplete="off"
            />
          </div>
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <label className="label" htmlFor="profile-conf" style={{ marginBottom: 0 }}>
                {t(lang, "profiles.conf")}
              </label>
              <button type="button" className="btn btn-ghost" onClick={onPickConfFile}>
                {t(lang, "profiles.pickFile")}
              </button>
            </div>
            <textarea
              id="profile-conf"
              className="textarea"
              value={conf}
              onChange={(e) => setConf(e.target.value)}
              placeholder={t(lang, "profiles.confPlaceholder")}
              rows={12}
              spellCheck={false}
            />
          </div>
          <button type="button" className="btn btn-primary" disabled={importBusy} onClick={() => void handleImport()}>
            {importBusy ? t(lang, "profiles.importing") : t(lang, "profiles.import")}
          </button>
          {importError ? <p className="form-error">{importError}</p> : null}
        </div>

        <div className="card">
          <p className="card-title" style={{ marginBottom: 16 }}>
            {t(lang, "profiles.saved")}
          </p>
          {exportError ? <p className="form-error">{exportError}</p> : null}
          {profiles.length === 0 ? (
            <div className="empty-state">{t(lang, "profiles.empty")}</div>
          ) : (
            <div className="profile-list">
              {profiles.map((p) => (
                <div key={p.id} className={`profile-card ${p.id === activeProfileId ? "active" : ""}`}>
                  <div>
                    <p className="profile-name">{p.name}</p>
                    <p className="profile-meta">{p.endpoint}</p>
                    <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                      <span className="pill">{modeLabel(lang)[p.mode]}</span>
                    </p>
                  </div>
                  <div className="profile-actions">
                    {p.id === activeProfileId ? (
                      <span className="pill">{t(lang, "profiles.active")}</span>
                    ) : (
                      <button type="button" className="btn btn-primary" onClick={() => void onSetActive(p.id)}>
                        {t(lang, "profiles.makeActive")}
                      </button>
                    )}
                    <button type="button" className="btn" onClick={() => void onSetMode(p.id, p.mode === "full" ? "split-routes" : "full")}>
                      {t(lang, "profiles.mode")}: {modeLabel(lang)[p.mode]}
                    </button>
                    <button type="button" className="btn" onClick={() => void handleExport(p)}>
                      {t(lang, "profiles.exportConf")}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => void onRemove(p.id)}>
                      {t(lang, "profiles.delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
