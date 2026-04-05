# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [1.0.0] — 2026-04-03

### Added

- **1.x stable line** — same features as 0.3.x; version marks readiness for production use with documented limitations.
- **THIRD_PARTY_NOTICES.md** — bundled components and license links.
- **SMOKE_TEST.md** — manual QA checklist before tagging releases.
- **User-facing errors** — stable `WIREPN_RUNTIME:*` codes from the main process, mapped to RU/EN in the renderer to match UI language.
- **GitHub issue template** — optional “Diagnostics” field (paste from Settings).
- **README:** Known limitations (admin, runtime binaries, unsigned builds / SmartScreen, manual update check).
- **RELEASING:** Semver note for 1.x breaking changes.
- **Release workflow:** optional Windows Authenticode signing when repository secrets `WINDOWS_CERTIFICATE_PFX` and `WINDOWS_CERTIFICATE_PASSWORD` are set (see README / RELEASING).

### Changed

- Onboarding modal: initial focus and Escape to dismiss (accessibility).

### Notes

- Install over 0.2.x / 0.3.x to upgrade; profile and settings formats unchanged.
- See **README → Known limitations** and **RELEASE_NOTES_1.0.0.md** for users.
- After merge, run **`git tag -a v1.0.0 -m "WirePN 1.0.0"`** and **`git push origin v1.0.0`** so the Release workflow builds **`WirePN Setup 1.0.0.exe`** (see `RELEASING.md`).

## [0.3.0] — 2026-04-03

### Added

- Profiles: import errors mapped to clear messages (missing fields, duplicate name, empty config).
- Profiles: **Choose file** to load a `.conf` from disk; **Export .conf** to download a saved profile (decrypted in the main process).
- Connect: prominent **error** banner when tunnel status is `error` (connection failed).
- Connect: **tunnel statistics** (rx/tx bytes, last handshake time, session duration) via WireGuard UAPI `get`; refresh every 2s while connected.
- Connect: **Ping server** — ICMP latency to the active profile’s endpoint host (Windows, PowerShell `Test-Connection`, three probes, average RTT).
- Settings: **Diagnostics** — WirePN / Electron / Node / OS version, user data path, **Copy support info** for bug reports.
- **CI:** GitHub Actions workflow on `main` / PR — `typecheck`, `lint`, `test`, `electron-vite` build.
- **Release:** workflow on `v*` tags — Windows NSIS + `.blockmap` uploaded to GitHub Releases (`CSC_IDENTITY_AUTO_DISCOVERY=false` for unsigned builds).
- **RELEASING.md** — version bump, tag, push, and what the automation publishes.
- **ESLint** — `eslint.config.mjs` (flat config) so `npm run lint` is usable locally and in CI.
- **Tests:** `parsePingStdoutMs`, `buildUapiSetBody`, `errorForWireguardGoEarlyExit` / Wintun access mapping.

### Fixed

- WireGuard UAPI **`get`:** read until `errno=` (IPC socket stays open), so tunnel **statistics** are not lost to timeouts.
- Settings diagnostics: load **health** even when another IPC call fails; show **Loading…** until data arrives; hint when the main process is an old build without version fields.

### Notes

- **GitHub Releases:** push tag **`v0.3.0`** with **`main`** up to date so CI attaches **`WirePN Setup 0.3.0.exe`** and **`.blockmap`**.
- No profile or settings migration; install over a previous build to upgrade.

## [0.2.0] — 2026-04-03

### Added

- App branding: `build/icon.ico`, optional `build/tray.png` for the system tray, favicon in the renderer window.
- Windows: embedded **`requireAdministrator`** manifest so the installed app requests UAC elevation on launch (required for WireGuard / Wintun).
- Build pipeline: `scripts/after-pack-win.mjs` runs **rcedit** after packaging to apply the manifest and icon without electron-builder’s **winCodeSign** unpack (avoids symlink privilege issues on some Windows setups).

### Notes

- **NSIS / installer:** `build/icon.ico` must include at least a **256×256** bitmap (electron-builder requirement for the installer wizard).
- **Code signing:** Authenticode is not applied in default builds; configure a certificate and `signtool` if you need signed binaries.
- Release assets: `WirePN Setup 0.2.0.exe` and the `.blockmap` file (for future auto-update tooling such as electron-updater).

---

*Short summary: 0.2.0 — branding, UAC on launch, reliable Windows packaging without winCodeSign symlink issues.*
