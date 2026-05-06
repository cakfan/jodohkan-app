import { expect, test, describe } from "bun:test";
import { cn } from "@/lib/utils";

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
      // p-4 should be overridden by p-8
      expect(cn("p-4", "p-8")).toBe("p-8");
      
      // grid-cols-1 should be overridden by grid-cols-2
      expect(cn("grid grid-cols-1", "grid-cols-2")).toBe("grid grid-cols-2");
    });

    test("handles arrays and nested structures (clsx behavior)", () => {
      expect(cn(["btn", "btn-primary"], { "is-loading": true, "is-disabled": false })).toBe("btn btn-primary is-loading");
    });

    test("returns empty string for empty inputs", () => {
      expect(cn()).toBe("");
    });
  });
});
