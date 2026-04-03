# Releasing WirePN

## Version

The single source of truth is **`package.json`** → `"version"` (semver). The same value is exposed at runtime as `app.getVersion()` and appears in **Settings → Diagnostics**.

## Steps (maintainer)

1. **Changelog** — Move items from `[Unreleased]` into a dated section `[x.y.z] — YYYY-MM-DD` in `CHANGELOG.md`, or add a short entry for the release.
2. **Commit** — `git add` + commit with a message like `chore: release 0.3.0`.
3. **Tag** — Create an annotated tag matching the version:

   ```bash
   git tag -a v0.3.0 -m "WirePN 0.3.0"
   ```

   Tag name **must** start with `v` (e.g. `v0.3.0`) so the **Release** workflow runs.

4. **Push** — Push commits and tags:

   ```bash
   git push origin main
   git push origin v0.3.0
   ```

5. **GitHub Release** — The workflow **Release** (`.github/workflows/release.yml`) builds the Windows NSIS installer on `windows-latest` and uploads:

   - `release/*.exe` (installer; required)
   - `release/*.blockmap` when present (optional; uploaded in a follow-up step if it exists)

   Release notes are auto-generated; you can edit the release on GitHub afterward.

   **If the release only shows “Source code (zip/tar.gz)” and no `.exe`:** the installer was **not** uploaded by Actions. Common causes:

   - The workflow file was **not on `main`** when you pushed the tag — merge `.github/workflows/release.yml`, push `main`, then **re-run** (see below).
   - You **created the release only in the GitHub UI** without running the workflow — delete the empty release assets expectation and either **push the tag again** after fixing, or use **Actions → Release → Run workflow** (workflow dispatch) and enter tag `v0.3.0`.
   - The **Build** step failed — open the failed job log; the workflow now **fails** if `release/*.exe` is missing.

   **Manual re-upload after fixing `main`:** Actions → **Release** → **Run workflow** → Tag: `v0.3.0` → Run. That checks out that tag, builds, and attaches the installer to the existing GitHub Release for that tag.

## CI

Every push or pull request to `main` / `master` runs **typecheck**, **lint**, **test**, and **electron-vite build** (`.github/workflows/ci.yml`). Fix failures before tagging.

## Signing

Default builds are **not** Authenticode-signed. For signed installers, configure a certificate in your environment and extend the release job (see `README.md` → Release builds).
