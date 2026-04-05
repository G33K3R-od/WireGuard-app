import { describe, expect, it } from "vitest";
import { compareSemver } from "../electron/core/updateCheck";

describe("compareSemver", () => {
  it("returns positive when first is newer", () => {
    expect(compareSemver("1.0.0", "0.9.9")).toBeGreaterThan(0);
    expect(compareSemver("0.4.0", "0.3.0")).toBeGreaterThan(0);
  });

  it("returns negative when first is older", () => {
    expect(compareSemver("0.3.0", "0.4.0")).toBeLessThan(0);
  });

  it("returns zero for equal core versions", () => {
    expect(compareSemver("0.3.0", "0.3.0")).toBe(0);
  });

  it("ignores leading v", () => {
    expect(compareSemver("v1.2.3", "1.2.3")).toBe(0);
  });

  it("returns 0 when unparseable", () => {
    expect(compareSemver("latest", "1.0.0")).toBe(0);
  });
});
