import { useEffect, useRef } from "react";
import type { UiLanguage } from "../i18n";
import { t } from "../i18n";

const README_URL = "https://github.com/G33K3R-od/WireGuard-app#readme";
const RELEASES_URL = "https://github.com/G33K3R-od/WireGuard-app/releases";

interface Props {
  lang: UiLanguage;
  onDismiss: () => void | Promise<void>;
}

export function OnboardingModal({ lang, onDismiss }: Props) {
  const dismissRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dismissRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void onDismiss();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          void onDismiss();
        }
      }}
    >
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-desc"
      >
        <h2 id="onboarding-title" className="page-title" style={{ marginTop: 0 }}>
          {t(lang, "onboarding.title")}
        </h2>
        <ul id="onboarding-desc" className="onboarding-list">
          <li>{t(lang, "onboarding.uac")}</li>
          <li>{t(lang, "onboarding.import")}</li>
        </ul>
        <p className="muted" style={{ marginBottom: 12 }}>
          {t(lang, "onboarding.links")}
        </p>
        <div className="onboarding-links">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void window.wirepn.openExternal(README_URL)}
          >
            {t(lang, "onboarding.readme")}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void window.wirepn.openExternal(RELEASES_URL)}
          >
            {t(lang, "onboarding.releases")}
          </button>
        </div>
        <div style={{ marginTop: 24 }}>
          <button ref={dismissRef} type="button" className="btn btn-primary" onClick={() => void onDismiss()}>
            {t(lang, "onboarding.dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
