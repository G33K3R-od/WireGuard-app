# WirePN Windows Client

Open-source Electron + TypeScript desktop client for WireGuard-based connectivity on Windows.

## Download

**Windows installer and release notes:** [github.com/G33K3R-od/WireGuard-app/releases](https://github.com/G33K3R-od/WireGuard-app/releases)

## Known limitations

- **Administrator rights** — WirePN requests elevation (UAC). WireGuard / Wintun cannot bring up a tunnel without it.
- **Runtime binaries** — `wireguard-go.exe` and `wintun.dll` must be present under `runtime/bin` (see `runtime/bin/README.txt`). The packaged installer includes or expects them per your build setup.
- **Unsigned default builds** — CI artifacts are often **not** Authenticode-signed; Windows SmartScreen may warn on first run. Configure signing for distribution (see **Release builds** and `RELEASING.md`).
- **Updates** — The app can **check** for a newer GitHub release; it does **not** auto-install updates (no bundled auto-updater until signing/publish is configured).

Bundled components and licenses: **[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)**.

## Features

- WireGuard profile management
- Connect/disconnect controls
- Runtime and logs UI pages
- Windows desktop packaging with Electron Builder

## Requirements

- Windows 10/11
- Node.js 20+
- npm 10+

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run build:win
```

## Release builds

`npm run build:win` writes installers under `release/`. **`build/icon.ico` must include at least a 256×256 bitmap** (electron-builder rejects smaller icons for the NSIS wizard). The project sets **`signAndEditExecutable` to `false`** so electron-builder does not unpack **winCodeSign** (that step can fail on Windows without symlink privileges). An **`afterPack`** script then runs **`rcedit`** from npm to embed **`requireAdministrator`** and the app icon into `WirePN.exe` without winCodeSign.

**GitHub Actions (Release workflow):** if repository secrets **`WINDOWS_CERTIFICATE_PFX`** (base64-encoded `.pfx`) and **`WINDOWS_CERTIFICATE_PASSWORD`** are set, the workflow imports the PFX and runs **`signtool sign`** on `WirePN.exe` and `*.exe` in `release/` after `electron-builder`. If those secrets are missing, builds stay unsigned (`CSC_IDENTITY_AUTO_DISCOVERY=false`). For local signing, use your own cert and `signtool` or electron-builder `CSC_LINK` / `CSC_KEY_PASSWORD`.

Pre-release manual checks: **[SMOKE_TEST.md](SMOKE_TEST.md)**.

## Runtime Binaries

The app expects Windows runtime binaries in `runtime/bin`:

- `wireguard-go.exe`
- `wintun.dll`

The repository already contains placeholder/runtime assets used for local development.

## Project Structure

- `src` - renderer (React) code
- `electron` - main/preload process and core runtime logic
- `runtime` - bundled runtime binaries and related files
- `scripts` - helper scripts for runtime setup and patches
- `tests` - unit tests

## Roadmap

Short-term priorities for community alignment:

| Priority | Item |
| --- | --- |
| UX | Smoother profile import/export and clearer validation feedback |
| Diagnostics | **Settings → Diagnostics:** app version, Electron/Node/OS, user data path, one-click copy for support; Connect debug block for runtime binaries |
| Quality | Broader tests around Electron main-process and preload behavior |
| Automation | GitHub Actions: CI on every PR (`typecheck`, `lint`, `test`, `electron-vite` build); **Release** workflow on `v*` tags builds the NSIS installer and attaches assets (see `RELEASING.md`) |

Items evolve with issues and PRs; pick work from open issues or propose a new one before large changes.

## Contributing

We welcome issues and pull requests. The full workflow (fork, branch, checks, PR) is in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

This project is published under the MIT License. See `LICENSE`. Third-party components: **`THIRD_PARTY_NOTICES.md`**.

## Security

If you discover a vulnerability, please do not open a public issue. Contact the maintainer directly.
