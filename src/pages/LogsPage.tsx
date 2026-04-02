import type { LogEntry } from "../../electron/shared/types";
import type { UiLanguage } from "../i18n";
import { t } from "../i18n";

interface Props {
  lang: UiLanguage;
  entries: LogEntry[];
}

export function LogsPage({ lang, entries }: Props) {
  const copy = async () => {
    const text = entries.map((e) => `[${e.ts}] ${e.level}: ${e.message}`).join("\n");
    try {
      await navigator.clipboard.writeText(text || "");
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <h2 className="page-title">{t(lang, "logs.title")}</h2>
        <p className="page-desc">{t(lang, "logs.desc")}</p>
      </header>

      <div className="log-toolbar">
        <span className="muted" style={{ margin: 0 }}>
          {entries.length} {t(lang, "logs.entries")}
        </span>
        <button type="button" className="btn btn-primary" onClick={() => void copy()}>
          {t(lang, "logs.copy")}
        </button>
      </div>

      <pre className="log-panel" role="log" aria-label={t(lang, "logs.aria")}>
        {entries.length === 0 ? (
          t(lang, "logs.empty")
        ) : (
          entries.map((e, i) => (
            <span key={i} className={`log-line log-line--${e.level}`}>
              {`[${e.ts}] ${e.level}: ${e.message}\n`}
            </span>
          ))
        )}
      </pre>
    </section>
  );
}
