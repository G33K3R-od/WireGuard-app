# WirePN 0.3.0 — Release notes

## Profiles

- Clear import errors: missing fields, empty config, **duplicate profile name**.
- Import **`.conf` from disk** (file picker).
- **Export** a saved profile to **`.conf`** (private key decrypted in the main process).

## Connect

- Prominent **error banner** when tunnel status is `error`.
- **Tunnel stats:** RX/TX bytes, **last handshake** time, session duration via WireGuard UAPI `get`, refreshed **about every 2s** while connected.
- **UAPI `get` fix:** stop reading when `errno=` appears (wireguard-go keeps the IPC socket open), so **stats are not lost** to timeouts.
- **Ping to server:** ICMP to the **Endpoint** host (PowerShell `Test-Connection`), **three probes**, UI shows **average** RTT.
- **Last handshake** time uses the **system locale** (date/time style), not only the app UI language.

## Settings

- **Diagnostics:** WirePN / Electron / Node / OS versions, user data path, **Copy support info** for bug reports.
- More reliable diagnostics: **health** is still fetched if another IPC call fails; **“Loading…”** while waiting; hint if the main process is an **old build** without version fields.

## Window

- **Maximum window size** is capped to the designed layout; **fullscreen is disabled** so the UI is not stretched to full screen.

## Build, CI, releases

- **GitHub Actions — CI:** on push/PR to `main` — `typecheck`, `lint`, `test`, **electron-vite** build.
- **GitHub Actions — Release:** on **`v*`** tags — **NSIS** build and upload of **`WirePN Setup 0.3.0.exe`** and **`.blockmap`** (unsigned by default: `CSC_IDENTITY_AUTO_DISCOVERY=false`).
- **`RELEASING.md`** — how to bump version, tag, and what gets published.
- **ESLint** (flat `eslint.config.mjs`) for local checks and CI.
- Extra **unit tests** (ping stdout parsing, UAPI helpers, Wintun error mapping).

## Upgrading

- **No data migration required** — run the new installer over the previous install; profiles and settings stay in the app user data folder.
