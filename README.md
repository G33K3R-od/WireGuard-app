# WirePN Windows Client

Open-source Electron + TypeScript desktop client for WireGuard-based connectivity on Windows.

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
npm run test
npm run build
npm run build:win
```

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

- Improve profile import/export UX and validation feedback
- Add richer connection diagnostics and health insights
- Expand test coverage for Electron main-process lifecycle
- Add CI for typecheck, tests, and Windows build verification

## Open Source

This project is published under the MIT License. See `LICENSE`.

Contributions are welcome. See `CONTRIBUTING.md`.

## Security

If you discover a vulnerability, please do not open a public issue. Contact the maintainer directly.
