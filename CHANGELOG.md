# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [0.3.1] — 2026-04-03

### Fixed

- **GitHub Releases:** tag `v0.3.1` is intended to ship the **NSIS installer** (`WirePN Setup 0.3.1.exe`) and **`.blockmap`** from CI once the full `main` branch is pushed (fixes missing or empty assets on earlier tags).

### Notes

- No profile or settings migration; replace the app by running the new installer over the previous one.

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

- Settings diagnostics: load **health** even when another IPC call fails; show **Loading…** until data arrives; hint when the main process is an old build without version fields.

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
