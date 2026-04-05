# WirePN 1.0.0

WirePN is an open-source Windows desktop client for WireGuard: import profiles, connect and disconnect, and view diagnostics.

## Requirements

- **Windows 10 or 11** (64-bit).
- The app requests **Administrator (UAC)** — WireGuard / Wintun need elevation to create the tunnel.
- **Runtime binaries** (bundled or placed per `runtime/bin/README.txt`):
  - `wireguard-go.exe`
  - `wintun.dll` (from [Wintun](https://www.wintun.net/))

## First run

Use **Profiles** to import a `.conf` from your VPN provider or admin, set the active profile, then connect from **Connect**.

## Updates

**Settings → Updates** checks the latest release on GitHub; there is **no automatic install**. Download the new installer from the release page when an update is available.

## Unsigned builds

Default GitHub Actions builds are **not** Authenticode-signed. Windows SmartScreen may show a warning on first run — “More info” → “Run anyway” if you trust the source. Signed builds are possible when the maintainer configures a certificate (see project README).

## Support

For bugs, use **GitHub Issues** and paste **Settings → Copy support info** (remove any secrets from logs if applicable).

Full changes: see `CHANGELOG.md` in the repository.
