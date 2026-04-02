import { randomUUID } from "node:crypto";

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

const readField = (lines: string[], key: string): string | undefined => {
  const prefix = `${key} =`;
  const line = lines.find((v) => v.startsWith(prefix));
  return line?.slice(prefix.length).trim();
};

export const parseWireguardConf = (name: string, conf: string): ParsedConf => {
  const lines = conf
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter((v) => v && !v.startsWith("#"));

  const privateKey = readField(lines, "PrivateKey");
  const address = readField(lines, "Address");
  const dns = readField(lines, "DNS");
  const endpoint = readField(lines, "Endpoint");
  const publicKey = readField(lines, "PublicKey");
  const allowedIps = readField(lines, "AllowedIPs") ?? "0.0.0.0/0,::/0";

  if (!privateKey || !endpoint || !address || !publicKey) {
    throw new Error("Invalid .conf: missing required fields");
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
