import { expect, test, describe } from "bun:test";
import { cn, computeAge } from "@/lib/utils";

describe("Utility Functions - Comprehensive Tests", () => {
  describe("cn (className merger)", () => {
    test("merges multiple class names", () => {
      expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
    });

    test("handles conditional classes", () => {
      expect(cn("base", true && "active", false && "hidden")).toBe("base active");
      expect(cn("base", null, undefined, 0, false, "extra")).toBe("base extra");
    });

    test("overrides tailwind classes correctly (tailwind-merge)", () => {
      expect(cn("p-4", "p-8")).toBe("p-8");

      expect(cn("grid grid-cols-1", "grid-cols-2")).toBe("grid grid-cols-2");
    });

    test("handles arrays and nested structures (clsx behavior)", () => {
      expect(cn(["btn", "btn-primary"], { "is-loading": true, "is-disabled": false })).toBe(
        "btn btn-primary is-loading"
      );
    });

    test("returns empty string for empty inputs", () => {
      expect(cn()).toBe("");
    });
  });

  describe("computeAge", () => {
    const ref = new Date("2026-05-08T00:00:00Z");

    test("returns null for null input", () => {
      expect(computeAge(null, ref)).toBeNull();
    });

    test("returns null for undefined input", () => {
      expect(computeAge(undefined, ref)).toBeNull();
    });

    test("returns null for empty string", () => {
      expect(computeAge("", ref)).toBeNull();
    });

    test("returns null for invalid date string", () => {
      expect(computeAge("not-a-date", ref)).toBeNull();
    });

    test("returns null for truly unparseable input", () => {
      expect(computeAge("xyz", ref)).toBeNull();
    });

    test("calculates age correctly for a birth date many years ago", () => {
      expect(computeAge("1990-01-01", ref)).toBe(36);
    });

    test("calculates age correctly for a recent birth date", () => {
      expect(computeAge("2024-05-08", ref)).toBe(2);
    });

    test("returns 0 for birth date on the reference date", () => {
      expect(computeAge("2026-05-08", ref)).toBe(0);
    });

    test("returns correct age when birthday not yet occurred this year", () => {
      expect(computeAge("2000-12-25", ref)).toBe(25);
    });

    test("returns correct age when birthday already occurred this year", () => {
      expect(computeAge("1995-01-01", ref)).toBe(31);
    });

    test("returns correct age for birthday on the reference date", () => {
      expect(computeAge("2000-05-08", ref)).toBe(26);
    });

    test("returns correct age for day before birthday", () => {
      expect(computeAge("2000-05-09", ref)).toBe(25);
    });

    test("handles leap year birth date", () => {
      expect(computeAge("2000-02-29", ref)).toBe(26);
    });

    test("works without optional today param (returns number or null)", () => {
      const result = computeAge("1990-01-01");
      expect(result === null || typeof result === "number").toBe(true);
    });
  });
});
