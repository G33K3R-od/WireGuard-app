import { randomUUID } from "node:crypto";
import type { VpnProfile } from "../shared/types";

export interface ParsedConf {
  id: string;
  name: string;
  endpoint: string;
  address: string;
  dns?: string;
  allowedIps: string;
  publicKey: string;
  privateKey: string;
}

export type ConfParseErrorCode =
  | "empty_conf"
  | "missing_private_key"
  | "missing_address"
  | "missing_endpoint"
  | "missing_public_key";

export class ConfParseError extends Error {
  constructor(public readonly code: ConfParseErrorCode) {
    super(`WirePN conf parse: ${code}`);
    this.name = "ConfParseError";
  }
}

const readField = (lines: string[], key: string): string | undefined => {
  const prefix = `${key} =`;
  const line = lines.find((v) => v.startsWith(prefix));
  return line?.slice(prefix.length).trim();
};

export const parseWireguardConf = (name: string, conf: string): ParsedConf => {
  const trimmed = conf.trim();
  if (!trimmed) {
    throw new ConfParseError("empty_conf");
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter((v) => v && !v.startsWith("#"));

  const privateKey = readField(lines, "PrivateKey");
  const address = readField(lines, "Address");
  const dns = readField(lines, "DNS");
  const endpoint = readField(lines, "Endpoint");
  const publicKey = readField(lines, "PublicKey");
  const allowedIps = readField(lines, "AllowedIPs") ?? "0.0.0.0/0,::/0";

  if (!privateKey) {
    throw new ConfParseError("missing_private_key");
  }
  if (!address) {
    throw new ConfParseError("missing_address");
  }
  if (!endpoint) {
    throw new ConfParseError("missing_endpoint");
  }
  if (!publicKey) {
    throw new ConfParseError("missing_public_key");
  }

  return {
    id: randomUUID(),
    name,
    endpoint,
    address,
    dns,
    allowedIps,
    publicKey,
    privateKey
  };
};

/** WireGuard .conf text for Interface + single Peer (used at runtime and export). */
export const buildWireguardConfFile = (
  profile: Pick<VpnProfile, "address" | "dns" | "publicKey" | "endpoint" | "allowedIps">,
  privateKey: string
): string => {
  const dnsLine = profile.dns ? `DNS = ${profile.dns}\n` : "";
  return `[Interface]\nPrivateKey = ${privateKey}\nAddress = ${profile.address}\n${dnsLine}\n[Peer]\nPublicKey = ${profile.publicKey}\nEndpoint = ${profile.endpoint}\nAllowedIPs = ${profile.allowedIps}\n`;
};
