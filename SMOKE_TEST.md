# Manual smoke test (before tagging a release)

Run on a **clean Windows 10/11 VM** (or a machine without a previous WirePN install), elevated as needed.

1. **Install** — Run `WirePN Setup x.y.z.exe` from `release/` or CI artifact; complete the wizard.
2. **Launch** — App starts; UAC prompt appears if not already elevated.
3. **Onboarding** — If shown, dismiss with “Got it” / «Понятно»; README/Releases links open in browser.
4. **Profiles** — Import a valid `.conf` (test profile); confirm profile appears.
5. **Connect** — Select profile, connect; status becomes connected (or note expected error if server unreachable).
6. **Disconnect** — Tunnel stops; status disconnected.
7. **Restart app** — Close and reopen; profiles and settings persist.
8. **Settings** — Toggle a setting (e.g. theme), save; refresh page or restart and confirm persistence.
9. **(Optional)** Enable auto-reconnect, force-kill `wireguard-go` or disconnect network, observe reconnect behavior.

Record WirePN version, Windows build, and any failures for the release notes or issues.
