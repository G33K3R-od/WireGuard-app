import { describe, expect, it } from "vitest";
import { parseWireguardConf } from "../electron/core/confParser";

describe("parseWireguardConf", () => {
  it("parses minimal valid profile", () => {
    const parsed = parseWireguardConf(
      "Demo",
      `[Interface]\nPrivateKey = abc\nAddress = 10.8.0.2/32\n\n[Peer]\nPublicKey = pub\nEndpoint = vpn.example.com:51820\nAllowedIPs = 0.0.0.0/0`
    );

    expect(parsed.name).toBe("Demo");
    expect(parsed.endpoint).toContain(":51820");
    expect(parsed.allowedIps).toBe("0.0.0.0/0");
  });

  it("throws on missing required fields", () => {
    expect(() => parseWireguardConf("X", "[Interface]"))
      .toThrow("Invalid .conf: missing required fields");
  });
});
