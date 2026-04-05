# Releasing WirePN

## Version

The single source of truth is **`package.json`** → `"version"` (semver). The same value is exposed at runtime as `app.getVersion()` and appears in **Settings → Diagnostics**. **Trim the value** (no trailing spaces) so `RELEASE_NOTES_<version>.md` resolves correctly.

## Semver (1.x)

For **1.x.y**: increment **patch** for fixes and small UX; **minor** for additive features. Treat as **major (2.0.0)** if you change the **`profiles.json`** or **`settings.json`** on-disk format in a non-migrating way, rename/remove **IPC channels** used by the shipped renderer, or break the WireGuard config import contract in a way that drops user data.

## Steps (maintainer)

1. **Changelog** — Move items from `[Unreleased]` into a dated section `[x.y.z] — YYYY-MM-DD` in `CHANGELOG.md`, or add a short entry for the release.
2. **Release notes (optional)** — If you add **`RELEASE_NOTES_<version>.md`** at the repo root (e.g. `RELEASE_NOTES_1.0.0.md` matching `package.json` version), the **Release** workflow uses it as the **GitHub Release description** and also attaches the same file as a **downloadable asset**. If the file is missing, a short placeholder is used instead.
3. **Commit** — `git add` + commit with a message like `chore: release 1.0.0`.
4. **Tag** — Create an annotated tag matching the version:

   ```bash
   git tag -a v1.0.0 -m "WirePN 1.0.0"
   ```

   Tag name **must** start with `v` (e.g. `v1.0.0`) so the **Release** workflow runs.

5. **Push** — Push commits and tags:

   ```bash
   git push origin main
   git push origin v1.0.0
   ```

6. **GitHub Release** — The workflow **Release** (`.github/workflows/release.yml`) builds the Windows NSIS installer on `windows-latest` and uploads:

   - `release/*.exe` (installer; required)
   - `release/*.blockmap` when present (optional; uploaded in a follow-up step if it exists)

   The release description comes from **`RELEASE_NOTES_<version>.md`** when present (see step 2); otherwise a short placeholder. You can still edit the release text on GitHub afterward.

   **If the release only shows “Source code (zip/tar.gz)” and no `.exe`:** the installer was **not** uploaded by Actions. Common causes:

   - The workflow file was **not on `main`** when you pushed the tag — merge `.github/workflows/release.yml`, push `main`, then **re-run** (see below).
   - You **created the release only in the GitHub UI** without running the workflow — delete the empty release assets expectation and either **push the tag again** after fixing, or use **Actions → Release → Run workflow** (workflow dispatch) and enter tag `v1.0.0` (or your version).
   - The **Build** step failed — open the failed job log; the workflow now **fails** if `release/*.exe` is missing.

   **Manual re-upload after fixing `main`:** Actions → **Release** → **Run workflow** → Tag: `v1.0.0` (match your tag) → Run. That checks out that tag, builds, and attaches the installer to the existing GitHub Release for that tag.

## CI

Every push or pull request to `main` / `master` runs **typecheck**, **lint**, **test**, and **electron-vite build** (`.github/workflows/ci.yml`). Fix failures before tagging.

## Signing

- **Forks / no cert:** leave secrets unset; Release builds unsigned installers (SmartScreen may warn users).
- **Signed CI builds:** add GitHub Actions secrets **`WINDOWS_CERTIFICATE_PFX`** (base64 of the `.pfx` file) and **`WINDOWS_CERTIFICATE_PASSWORD`**. The Release workflow signs `WirePN.exe` under `release/win-unpacked` and NSIS `*.exe` in `release/` with **`signtool`** (Windows SDK on `windows-latest`).

Local signing: configure **`CSC_LINK`** / **`CSC_KEY_PASSWORD`** or run **`signtool`** yourself; see Electron Builder docs.

Manual QA before tagging: **`SMOKE_TEST.md`**.
