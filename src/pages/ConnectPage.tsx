import { useEffect, useState } from "react";
import type { RuntimePaths } from "../../electron/core/runtimeManager";
import type { HealthReport, PingResult, RuntimeState, TunnelStats, VpnProfile } from "../../electron/shared/types";
import { formatBytes, formatConnectedDuration, formatHandshake } from "../connectUi";
import type { UiLanguage } from "../i18n";
import { statusText, t } from "../i18n";
import { GITHUB_RELEASES_URL } from "../urls";

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
  const [stats, setStats] = useState<TunnelStats | null>(null);
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [pingBusy, setPingBusy] = useState(false);

  useEffect(() => {
    if (status !== "connected") {
      setStats(null);
      return;
    }
    let cancelled = false;
    const tick = async () => {
      try {
        const s = await window.wirepn.getTunnelStats();
        if (!cancelled) {
          setStats(s);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      }
    };
    void tick();
    const id = window.setInterval(tick, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [status]);

  const runPing = async () => {
    setPingBusy(true);
    setPingResult(null);
    try {
      const r = await window.wirepn.pingEndpoint(profile?.id);
      setPingResult(r);
    } catch (e) {
      setPingResult({ ok: false, host: "", error: String(e) });
    } finally {
      setPingBusy(false);
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <h2 className="page-title">{t(lang, "connect.title")}</h2>
        <p className="page-desc">{t(lang, "connect.desc")}</p>
        <p className="page-releases muted">
          <a href={GITHUB_RELEASES_URL} target="_blank" rel="noreferrer">
            {t(lang, "connect.releasesLink")}
          </a>
        </p>
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

          {status === "error" && state?.message ? (
            <div className="alert alert-error" style={{ marginTop: 16 }}>
              <strong>{t(lang, "connect.errorTitle")}</strong>
              <p style={{ marginBottom: 0, marginTop: 8, whiteSpace: "pre-wrap" }}>{state.message}</p>
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

          {state?.message && status !== "error" ? (
            <p className="muted" style={{ marginTop: 16, marginBottom: 0 }}>
              {state.message}
            </p>
          ) : null}

          {status === "connected" && stats ? (
            <div className="connect-stats" style={{ marginTop: 16 }}>
              <p className="card-title" style={{ marginBottom: 12 }}>
                {t(lang, "connect.statsTitle")}
              </p>
              <div className="health-grid connect-stats-grid">
                <div className="health-cell">
                  <div className="health-label">{t(lang, "connect.stats.rx")}</div>
                  <div className="health-value ok">{formatBytes(stats.rxBytes)}</div>
                </div>
                <div className="health-cell">
                  <div className="health-label">{t(lang, "connect.stats.tx")}</div>
                  <div className="health-value ok">{formatBytes(stats.txBytes)}</div>
                </div>
                <div className="health-cell">
                  <div className="health-label">{t(lang, "connect.stats.handshake")}</div>
                  <div className="health-value">{formatHandshake(lang, stats.lastHandshakeSec)}</div>
                </div>
                <div className="health-cell">
                  <div className="health-label">{t(lang, "connect.stats.connectedFor")}</div>
                  <div className="health-value">{formatConnectedDuration(stats.connectedSinceIso)}</div>
                </div>
              </div>
            </div>
          ) : null}

          {status === "connected" && !stats ? (
            <p className="muted" style={{ marginTop: 16, marginBottom: 0 }}>
              {t(lang, "connect.stats.na")}
            </p>
          ) : null}

          <div className="connect-ping" style={{ marginTop: 16 }}>
            <p className="card-title" style={{ marginBottom: 8 }}>
              {t(lang, "connect.ping")}
            </p>
            <p className="muted" style={{ marginTop: 0, marginBottom: 12, fontSize: "0.875rem" }}>
              {t(lang, "connect.pingHint")}
            </p>
            <div className="connect-ping-row">
              <button type="button" className="btn btn-primary" disabled={!profile || !runtimeReady || pingBusy} onClick={() => void runPing()}>
                {pingBusy ? "…" : t(lang, "connect.pingRun")}
              </button>
              {pingResult ? (
                <span className="connect-ping-result">
                  {pingResult.ok ? (
                    <>
                      <span className="kbd">{pingResult.host}</span>
                      {" — "}
                      <strong>{pingResult.ms}</strong> {t(lang, "connect.pingMs")}
                    </>
                  ) : (
                    <>
                      <span className="kbd">{pingResult.host || "—"}</span>
                      {" — "}
                      <span className="text-danger">{pingResult.error ?? t(lang, "connect.pingFail")}</span>
                    </>
                  )}
                </span>
              ) : null}
            </div>
          </div>
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
