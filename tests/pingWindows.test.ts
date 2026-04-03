import { describe, expect, it } from "vitest";
import { parsePingStdoutMs } from "../electron/core/pingWindows";

describe("parsePingStdoutMs", () => {
  it("parses a single integer line", () => {
    expect(parsePingStdoutMs("243")).toBe(243);
    expect(parsePingStdoutMs("243\n")).toBe(243);
  });

  it("parses first numeric-only line", () => {
    expect(parsePingStdoutMs("noise\n42")).toBe(42);
  });

  it("ignores BOM", () => {
    expect(parsePingStdoutMs("\uFEFF100")).toBe(100);
  });

  it("returns null when no plain integer line", () => {
    expect(parsePingStdoutMs("")).toBeNull();
    expect(parsePingStdoutMs("123ms")).toBeNull();
    expect(parsePingStdoutMs("no response")).toBeNull();
  });
});
