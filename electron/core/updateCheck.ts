import type { UpdateCheckResult } from "../shared/types";

/** GitHub Releases API — same repo as README / installers. */
const OWNER = "G33K3R-od";
const REPO = "WireGuard-app";

/** Parse leading numeric semver from tag (e.g. v0.3.1-beta → 0.3.1). */
const parseSemverParts = (tag: string): number[] => {
  const m = tag.replace(/^v/i, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) {
    return [];
  }
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
};

/** >0 if a > b, <0 if a < b, 0 if equal or unparseable. */
export const compareSemver = (a: string, b: string): number => {
  const pa = parseSemverParts(a);
  const pb = parseSemverParts(b);
  if (pa.length === 0 || pb.length === 0) {
    return 0;
  }
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) {
      return pa[i] - pb[i];
    }
  }
  return 0;
};

export async function checkGitHubLatestRelease(currentVersion: string): Promise<UpdateCheckResult> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": `WirePN/${currentVersion} (Electron)`
      }
    });
    if (!res.ok) {
      return {
        ok: false,
        updateAvailable: false,
        currentVersion,
        error: `GitHub API ${res.status}`
      };
    }
    const data = (await res.json()) as { tag_name?: string; html_url?: string };
    const tag = data.tag_name ?? "";
    const latestCore = tag.replace(/^v/i, "").match(/^(\d+\.\d+\.\d+)/)?.[1] ?? tag.replace(/^v/i, "");
    const cmp = compareSemver(latestCore, currentVersion);
    return {
      ok: true,
      updateAvailable: cmp > 0,
      currentVersion,
      latestVersion: latestCore || undefined,
      releaseUrl: data.html_url
    };
  } catch (e) {
    return {
      ok: false,
      updateAvailable: false,
      currentVersion,
      error: e instanceof Error ? e.message : String(e)
    };
  }
}
