import type { RuntimePaths } from "../../electron/core/runtimeManager";
import type { HealthReport, RuntimeState, VpnProfile } from "../../electron/shared/types";
import type { UiLanguage } from "../i18n";
import { statusText, t } from "../i18n";

interface Props {
  lang: UiLanguage;
  showDebug: boolean;
  state: RuntimeState | null;
  profile?: VpnProfile;
  health: HealthReport | null;
  runtimePaths: RuntimePaths | null;
  onConnect: (profileId?: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export function ConnectPage({ lang, showDebug, state, profile, health, runtimePaths, onConnect, onDisconnect }: Props) {
  const status = state?.status ?? "disconnected";
  const runtimeReady = Boolean(health?.runtimeBinary && health?.wintunBinary);

  return (
    <section className="page">
      <header className="page-header">
        <h2 className="page-title">{t(lang, "connect.title")}</h2>
        <p className="page-desc">{t(lang, "connect.desc")}</p>
      </header>

      <div className="stack">
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">{t(lang, "connect.currentProfile")}</p>
              <p className="card-heading">{profile?.name ?? t(lang, "connect.notSelected")}</p>
              <p className="muted" style={{ marginTop: 8 }}>
                {t(lang, "connect.server")}: <span className="kbd">{profile?.endpoint ?? "—"}</span>
              </p>
            </div>
            <span className={`badge badge-${status}`}>
              <span className="badge-dot" aria-hidden />
              {statusText(lang, status)}
            </span>
          </div>

          {!runtimeReady && runtimePaths ? (
            <div className="alert alert-error" style={{ marginTop: 16 }}>
              <strong>{t(lang, "connect.missingRuntimeTitle")}</strong> {t(lang, "connect.missingRuntimeHint")}
              <div style={{ marginTop: 8 }}>
                <span className="kbd">{runtimePaths.binDir}</span>
              </div>
              <ul>
                <li>
                  <span className="kbd">wireguard-go.exe</span> — {t(lang, "connect.readmeSee")}{" "}
                  <span className="kbd">runtime/bin/README.txt</span>
                </li>
                <li>
                  <span className="kbd">wintun.dll</span> —{" "}
                  <a href="https://www.wintun.net/" target="_blank" rel="noreferrer">
                    wintun.net
                  </a>
                </li>
              </ul>
              <p className="muted" style={{ marginBottom: 0 }}>
                {t(lang, "connect.missingRuntimeRefreshHint")}
              </p>
            </div>
          ) : null}

          <div className="connect-actions">
            <div className="connect-primary-wrap">
              <button
                type="button"
                className="btn btn-primary btn-lg btn-block"
                disabled={!profile || !runtimeReady || status === "connected" || status === "connecting"}
                onClick={() => void onConnect(profile?.id)}
              >
                {t(lang, "connect.connectBtn")}
              </button>
            </div>
            <button
              type="button"
              className="btn btn-danger"
              disabled={status !== "connected" && status !== "connecting"}
              onClick={() => void onDisconnect()}
            >
              {t(lang, "connect.disconnectBtn")}
            </button>
          </div>

          {state?.message ? (
            <p className="muted" style={{ marginTop: 16, marginBottom: 0 }}>
              {state.message}
            </p>
          ) : null}
        </div>

        {showDebug ? (
          <div className="card">
            <p className="card-title" style={{ marginBottom: 12 }}>
              {t(lang, "connect.componentsTitle")}
            </p>
            <div className="health-grid">
              <div className="health-cell">
                <div className="health-label">wireguard-go</div>
                <div className={`health-value ${health?.runtimeBinary ? "ok" : "bad"}`}>
                  {health?.runtimeBinary ? t(lang, "connect.componentFound") : t(lang, "connect.componentMissing")}
                </div>
              </div>
              <div className="health-cell">
                <div className="health-label">Wintun</div>
                <div className={`health-value ${health?.wintunBinary ? "ok" : "bad"}`}>
                  {health?.wintunBinary ? t(lang, "connect.componentFound") : t(lang, "connect.componentMissing")}
                </div>
              </div>
              <div className="health-cell">
                <div className="health-label">{t(lang, "connect.profilesCount")}</div>
                <div className="health-value">{health?.profileCount ?? 0}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
