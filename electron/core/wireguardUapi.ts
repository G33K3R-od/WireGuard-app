import type { ChildProcess } from "node:child_process";
import * as net from "node:net";

/** Wintun adapter name; must match the single CLI arg passed to wireguard-go.exe */
export const WG_TUN_INTERFACE_NAME = "WirePN0";

/** Shown when Wintun returns ERROR_ACCESS_DENIED (0x5) without admin rights */
export const WINTUN_ADMIN_REQUIRED_MESSAGE =
  "Нужны права администратора: Wintun не может создать сетевой адаптер. " +
  "Запустите WirePN от имени администратора. В режиме разработки запустите терминал или IDE с правами администратора, затем снова npm run dev.";

/** Upstream UAPI pipe uses SYSTEM as owner; many sessions cannot create that pipe. */
export const WG_UAPI_PIPE_MESSAGE =
  "Не удалось открыть UAPI pipe WireGuard (ошибка владельца объекта). " +
  "Пересоберите wireguard-go скриптом apps/wirepn-windows/scripts/fetch-runtime.ps1 — в сборке исправлен путь к pipe. " +
  "Либо запустите WirePN с правами администратора вместе с официальным wireguard-go.exe.";

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
    return new Error(WINTUN_ADMIN_REQUIRED_MESSAGE);
  }
  if (isUapiPipeOwnerError(stderr)) {
    return new Error(WG_UAPI_PIPE_MESSAGE);
  }
  return new Error(`wireguard-go завершился до готовности туннеля (код ${code ?? "?"})`);
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
  throw new Error(`WireGuard UAPI pipe not ready: ${lastErr?.message ?? "timeout"}`);
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
  throw new Error(`WireGuard UAPI pipe not ready: ${lastErr?.message ?? "timeout"}`);
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
      finish(() => reject(new Error("UAPI set timeout")));
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
          reject(new Error(`UAPI failed (errno=${m[1]})`));
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
          reject(new Error("UAPI closed without errno response"));
        }
      });
    });
  });
}
