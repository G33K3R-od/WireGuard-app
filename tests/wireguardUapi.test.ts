import { describe, expect, it } from "vitest";
import { RuntimeErrorCode } from "../electron/shared/runtimeErrorCodes";
import {
  buildUapiSetBody,
  errorForWireguardGoEarlyExit,
  isWintunAccessDenied,
  parseUapiGetStats,
  parseWireguardEndpointHost
} from "../electron/core/wireguardUapi";

describe("parseWireguardEndpointHost", () => {
  it("parses host:port", () => {
    expect(parseWireguardEndpointHost("vpn.example.com:51820")).toBe("vpn.example.com");
    expect(parseWireguardEndpointHost("95.181.173.63:51820")).toBe("95.181.173.63");
  });

  it("parses bracketed IPv6", () => {
    expect(parseWireguardEndpointHost("[2001:db8::1]:51820")).toBe("2001:db8::1");
  });
});

describe("parseUapiGetStats", () => {
  it("extracts peer counters from UAPI get blob", () => {
    const sample = `errno=0

public_key=abcd
rx_bytes=1024
tx_bytes=2048
last_handshake_time_sec=1700000000
`;
    const s = parseUapiGetStats(sample);
    expect(s).not.toBeNull();
    expect(s!.rxBytes).toBe(1024);
    expect(s!.txBytes).toBe(2048);
    expect(s!.lastHandshakeSec).toBe(1700000000);
  });

  it("returns null on errno != 0", () => {
    expect(parseUapiGetStats("errno=1\n")).toBeNull();
  });
});

describe("buildUapiSetBody", () => {
  it("includes peer, endpoint, allowed IPs, and keepalive", () => {
    const priv32 = Buffer.alloc(32, 9).toString("base64");
    const pub32 = Buffer.alloc(32, 10).toString("base64");
    const body = buildUapiSetBody(priv32, pub32, "vpn.example.com:51820", "0.0.0.0/0, ::/0");
    expect(body).toContain("endpoint=vpn.example.com:51820");
    expect(body).toContain("allowed_ip=0.0.0.0/0");
    expect(body).toContain("allowed_ip=::/0");
    expect(body).toContain("persistent_keepalive_interval=25");
  });
});

describe("errorForWireguardGoEarlyExit", () => {
  it("maps Wintun access denied", () => {
    const e = errorForWireguardGoEarlyExit("Failed to create TUN: Access is denied (0x00000005)", 1);
    expect(isWintunAccessDenied("Failed to create TUN: Access is denied (0x00000005)")).toBe(true);
    expect(e.message).toContain(RuntimeErrorCode.WINTUN_ADMIN);
  });

  it("uses generic message for unknown stderr", () => {
    const e = errorForWireguardGoEarlyExit("something else", 2);
    expect(e.message).toContain(RuntimeErrorCode.WG_GO_EARLY_EXIT);
  });
});
