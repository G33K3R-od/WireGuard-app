import type { UiLanguage } from "./i18n";
import { t } from "./i18n";

export const formatBytes = (n: number): string => {
  if (n < 1024) {
    return `${n} B`;
  }
  if (n < 1024 ** 2) {
    return `${(n / 1024).toFixed(1)} KB`;
  }
  if (n < 1024 ** 3) {
    return `${(n / 1024 ** 2).toFixed(1)} MB`;
  }
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
};

export const formatConnectedDuration = (iso: string | undefined): string => {
  if (!iso) {
    return "—";
  }
  const start = new Date(iso).getTime();
  const s = Math.floor((Date.now() - start) / 1000);
  if (s < 0 || Number.isNaN(s)) {
    return "—";
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m ${sec}s`;
  }
  return `${sec}s`;
};

export const formatHandshake = (lang: UiLanguage, lastHandshakeSec: number): string => {
  if (lastHandshakeSec <= 0) {
    return t(lang, "connect.stats.handshakePending");
  }
  const d = new Date(lastHandshakeSec * 1000);
  if (Number.isNaN(d.getTime())) {
    return t(lang, "connect.stats.na");
  }
  // OS locale + calendar/12–24h from system (not app UI language).
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium"
  });
};
