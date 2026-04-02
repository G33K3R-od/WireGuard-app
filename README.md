# WirePN Windows Client (MVP)

Electron + TypeScript desktop client for WireGuard-based connectivity.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run typecheck
npm run test
npm run build
```

## Build installer

```bash
npm run build:win
```

## Runtime binaries

Place Windows binaries into `runtime/bin`:

- `wireguard-go.exe`
- `wintun.dll`

MVP keeps lifecycle and health management in Electron main process.
