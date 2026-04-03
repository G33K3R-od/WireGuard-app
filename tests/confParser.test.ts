import { describe, expect, it } from "vitest";
import { ConfParseError, parseWireguardConf } from "../electron/core/confParser";

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

  it("throws ConfParseError on missing required fields", () => {
    expect(() => parseWireguardConf("X", "[Interface]")).toThrow(ConfParseError);
    try {
      parseWireguardConf("X", "[Interface]");
    } catch (e) {
      expect(e).toBeInstanceOf(ConfParseError);
      expect((e as ConfParseError).code).toBe("missing_private_key");
    }
  });
});
