import { execFile } from "node:child_process";

/**
 * ICMP latency via PowerShell `Test-Connection` (Windows).
 * Uses 3 probes and the **average** ResponseTime (ms) so one-off spikes and display jitter are less misleading.
 */
export function pingHostWindows(host: string): Promise<{ ok: boolean; ms?: number; error?: string }> {
  return new Promise((resolve) => {
    const escaped = host.replace(/'/g, "''");
    const script =
      `$r = Test-Connection -ComputerName '${escaped}' -Count 3 -ErrorAction SilentlyContinue; ` +
      `if ($r) { [math]::Round(($r | Measure-Object -Property ResponseTime -Average).Average) } else { exit 1 }`;
    execFile(
      "powershell.exe",
      ["-NoProfile", "-Command", script],
      { timeout: 15_000, windowsHide: true, encoding: "utf8" },
      (err, stdout, stderr) => {
        const out = String(stdout ?? "").trim();
        const ms = parsePingStdoutMs(out);
        if (ms !== null) {
          resolve({ ok: true, ms });
          return;
        }
        const detail = String(stderr ?? "").trim() || out || err?.message || "no response";
        resolve({ ok: false, error: detail });
      }
    );
  });
}

/** First line that looks like a non-negative integer (ms); ignores BOM / stray table noise. */
export function parsePingStdoutMs(text: string): number | null {
  for (const line of text.split(/\r?\n/)) {
    const t = line.replace(/^\uFEFF/, "").trim();
    if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      if (!Number.isNaN(n) && n >= 0) {
        return n;
      }
    }
  }
  return null;
}
