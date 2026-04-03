# WirePN Windows Client

Open-source Electron + TypeScript desktop client for WireGuard-based connectivity on Windows.

## Download

**Windows installer and release notes:** [github.com/G33K3R-od/WireGuard-app/releases](https://github.com/G33K3R-od/WireGuard-app/releases)

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

`npm run build:win` writes installers under `release/`. **`build/icon.ico` must include at least a 256×256 bitmap** (electron-builder rejects smaller icons for the NSIS wizard). The project sets **`signAndEditExecutable` to `false`** so electron-builder does not unpack **winCodeSign** (that step can fail on Windows without symlink privileges). An **`afterPack`** script then runs **`rcedit`** from npm to embed **`requireAdministrator`** and the app icon into `WirePN.exe` without winCodeSign. Code signing is skipped when no certificate is configured; add your own cert and `signtool` setup if you need Authenticode.

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

This project is published under the MIT License. See `LICENSE`.

## Security

If you discover a vulnerability, please do not open a public issue. Contact the maintainer directly.
