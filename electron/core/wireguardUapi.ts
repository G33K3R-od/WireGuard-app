import type { ChildProcess } from "node:child_process";
import * as net from "node:net";
import { RuntimeErrorCode, runtimeError } from "../shared/runtimeErrorCodes";

/** Wintun adapter name; must match the single CLI arg passed to wireguard-go.exe */
export const WG_TUN_INTERFACE_NAME = "WirePN0";

export function isWintunAccessDenied(stderr: string): boolean {
  return /Access is denied|0x00000005|Failed to create TUN/i.test(stderr);
}

export function isUapiPipeOwnerError(stderr: string): boolean {
  return (
    /Failed to listen on uapi socket/i.test(stderr) &&
    /This security ID may not be assigned as the owner/i.test(stderr)
  );
}

export function errorForWireguardGoEarlyExit(stderr: string, code: number | null): Error {
  if (isWintunAccessDenied(stderr)) {
    return runtimeError(RuntimeErrorCode.WINTUN_ADMIN);
  }
  if (isUapiPipeOwnerError(stderr)) {
    return runtimeError(RuntimeErrorCode.UAPI_PIPE_OWNER);
  }
  return runtimeError(RuntimeErrorCode.WG_GO_EARLY_EXIT, String(code ?? "?"));
}

/** Official wireguard-go (elevated): ProtectedPrefix pipe. Patched build (fetch-runtime.ps1): `WireGuard\`. */
export const wireguardUapiPipePathProtected = (interfaceName: string): string =>
  `\\\\.\\pipe\\ProtectedPrefix\\Administrators\\WireGuard\\${interfaceName}`;

export const wireguardUapiPipePath = (interfaceName: string): string =>
  `\\\\.\\pipe\\WireGuard\\${interfaceName}`;

export function wireguardUapiPipePathCandidates(interfaceName: string): string[] {
  return [wireguardUapiPipePathProtected(interfaceName), wireguardUapiPipePath(interfaceName)];
}

export function wgKeyBase64ToHex(keyB64: string): string {
  const buf = Buffer.from(keyB64.trim(), "base64");
  if (buf.length !== 32) {
    throw new Error(`Invalid WireGuard key length (${buf.length}), expected 32 bytes`);
  }
  return buf.toString("hex");
}

export function buildUapiSetBody(
  privateKeyB64: string,
  publicKeyB64: string,
  endpoint: string,
  allowedIpsCsv: string
): string {
  const priv = wgKeyBase64ToHex(privateKeyB64);
  const pub = wgKeyBase64ToHex(publicKeyB64);
  const lines = [`private_key=${priv}`, `replace_peers=true`, `public_key=${pub}`, `endpoint=${endpoint}`];
  for (const cidr of allowedIpsCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    lines.push(`allowed_ip=${cidr}`);
  }
  lines.push("persistent_keepalive_interval=25");
  return `${lines.join("\n")}\n\n`;
}

function tryConnectPipeOnce(pipePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const s = net.createConnection(pipePath);
    s.once("connect", () => {
      s.destroy();
      resolve();
    });
    s.once("error", reject);
  });
}

export async function waitForWireGuardUapiPipe(interfaceName: string, timeoutMs = 30000): Promise<void> {
  const paths = wireguardUapiPipePathCandidates(interfaceName);
  const deadline = Date.now() + timeoutMs;
  let lastErr: Error | undefined;
  while (Date.now() < deadline) {
    for (const path of paths) {
      try {
        await tryConnectPipeOnce(path);
        return;
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw runtimeError(RuntimeErrorCode.UAPI_PIPE_NOT_READY, lastErr?.message ?? "timeout");
}

export async function waitForWireGuardUapiPipeWhileProcessRuns(
  interfaceName: string,
  proc: ChildProcess,
  stderrAcc: { text: string },
  timeoutMs = 30000
): Promise<string> {
  const paths = wireguardUapiPipePathCandidates(interfaceName);
  const deadline = Date.now() + timeoutMs;
  let lastErr: Error | undefined;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) {
      throw errorForWireguardGoEarlyExit(stderrAcc.text, proc.exitCode);
    }
    for (const path of paths) {
      try {
        await tryConnectPipeOnce(path);
        return path;
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw runtimeError(RuntimeErrorCode.UAPI_PIPE_NOT_READY, lastErr?.message ?? "timeout");
}

export async function uapiSet(pipePath: string, setBody: string): Promise<void> {
  const path = pipePath;
  await new Promise<void>((resolve, reject) => {
    let buf = "";
    let settled = false;
    const socket = net.createConnection(path);
    const finish = (fn: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      fn();
    };
    const timeout = setTimeout(() => {
      socket.destroy();
      finish(() => reject(runtimeError(RuntimeErrorCode.UAPI_SET_TIMEOUT)));
    }, 15000);
    socket.on("connect", () => {
      socket.write(`set=1\n${setBody}`);
    });
    socket.on("data", (chunk) => {
      buf += String(chunk);
      const m = buf.match(/errno=(\d+)/);
      if (!m) {
        return;
      }
      socket.destroy();
      finish(() => {
        if (m[1] !== "0") {
          reject(runtimeError(RuntimeErrorCode.UAPI_SET_FAILED, `errno=${m[1]}`));
        } else {
          resolve();
        }
      });
    });
    socket.on("error", (err) => {
      finish(() => reject(err));
    });
    socket.on("close", () => {
      finish(() => {
        if (!buf.includes("errno=")) {
          reject(runtimeError(RuntimeErrorCode.UAPI_CLOSED_NO_ERRNO));
        }
      });
    });
  });
}

/** Host part of WireGuard `Endpoint` (`host:port`, `[ipv6]:port`). */
export const parseWireguardEndpointHost = (endpoint: string): string | null => {
  const t = endpoint.trim();
  if (!t) {
    return null;
  }
  if (t.startsWith("[")) {
    const m = /^\[([^\]]+)]/.exec(t);
    return m ? m[1].trim() : null;
  }
  const colon = t.lastIndexOf(":");
  if (colon <= 0) {
    return t;
  }
  return t.slice(0, colon).trim();
};

export const parseUapiGetStats = (buf: string): { rxBytes: number; txBytes: number; lastHandshakeSec: number } | null => {
  const errnoMatch = buf.match(/errno=(\d+)/);
  if (!errnoMatch || errnoMatch[1] !== "0") {
    return null;
  }
  let rxBytes = 0;
  let txBytes = 0;
  let lastHandshakeSec = 0;
  for (const line of buf.split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim();
    if (k === "rx_bytes") {
      rxBytes = parseInt(v, 10) || 0;
    }
    if (k === "tx_bytes") {
      txBytes = parseInt(v, 10) || 0;
    }
    if (k === "last_handshake_time_sec") {
      lastHandshakeSec = parseInt(v, 10) || 0;
    }
  }
  return { rxBytes, txBytes, lastHandshakeSec };
};

/**
 * Read full device state from WireGuard UAPI (`get=1`).
 * wireguard-go keeps the IPC connection open after each op (see `IpcHandle` loop), so we must not
 * wait for `end`/`close` — we stop as soon as the response includes `errno=…` (status is written last).
 */
export async function uapiGet(pipePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let buf = "";
    let settled = false;
    const socket = net.createConnection(pipePath);
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        socket.destroy();
        reject(runtimeError(RuntimeErrorCode.UAPI_GET_TIMEOUT));
      }
    }, 10_000);
    const finishOk = (data: string): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      socket.destroy();
      resolve(data);
    };
    const finishErr = (err: Error): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      socket.destroy();
      reject(err);
    };
    socket.on("connect", () => {
      socket.write("get=1\n\n");
    });
    socket.on("data", (chunk) => {
      buf += String(chunk);
      if (/errno=\d+/.test(buf)) {
        finishOk(buf);
      }
    });
    socket.on("error", (err) => {
      finishErr(err instanceof Error ? err : new Error(String(err)));
    });
    socket.on("close", () => {
      if (!settled && /errno=\d+/.test(buf)) {
        finishOk(buf);
      }
    });
  });
}
