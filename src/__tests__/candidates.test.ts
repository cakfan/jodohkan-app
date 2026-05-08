import { describe, it, expect } from "bun:test";
import { computeAgeDateBoundary } from "@/lib/utils";

describe("computeAgeDateBoundary", () => {
  it("returns ISO date string", () => {
    const result = computeAgeDateBoundary(25, "min");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("ageMin: subtracts exact years from today", () => {
    const now = new Date();
    const expected = new Date(now);
    expected.setFullYear(expected.getFullYear() - 25);
    const expectedStr = expected.toISOString().split("T")[0];

    expect(computeAgeDateBoundary(25, "min")).toBe(expectedStr);
  });

  it("ageMax: subtracts age + 1 from today", () => {
    const now = new Date();
    const expected = new Date(now);
    expected.setFullYear(expected.getFullYear() - 31);
    const expectedStr = expected.toISOString().split("T")[0];

    expect(computeAgeDateBoundary(30, "max")).toBe(expectedStr);
  });

  it("ageMin with 17 (minimum)", () => {
    const now = new Date();
    const expected = new Date(now);
    expected.setFullYear(expected.getFullYear() - 17);
    const expectedStr = expected.toISOString().split("T")[0];

    expect(computeAgeDateBoundary(17, "min")).toBe(expectedStr);
  });

  it("ageMax with 70 (maximum)", () => {
    const now = new Date();
    const expected = new Date(now);
    expected.setFullYear(expected.getFullYear() - 71);
    const expectedStr = expected.toISOString().split("T")[0];

    expect(computeAgeDateBoundary(70, "max")).toBe(expectedStr);
  });

  it("ageMin with 0 returns today's date", () => {
    const now = new Date();
    const expectedStr = now.toISOString().split("T")[0];
    expect(computeAgeDateBoundary(0, "min")).toBe(expectedStr);
  });

  it("ageMax with 0 returns date for 1 year ago", () => {
    const now = new Date();
    const expected = new Date(now);
    expected.setFullYear(expected.getFullYear() - 1);
    const expectedStr = expected.toISOString().split("T")[0];
    expect(computeAgeDateBoundary(0, "max")).toBe(expectedStr);
  });

  it("ageMin and ageMax produce different boundaries for same age", () => {
    const minBoundary = computeAgeDateBoundary(30, "min");
    const maxBoundary = computeAgeDateBoundary(30, "max");

    const minDate = new Date(minBoundary);
    const maxDate = new Date(maxBoundary);
    expect(minDate.getTime()).toBeGreaterThan(maxDate.getTime());
  });

  it("creates wider range for larger ageMax", () => {
    const narrow = computeAgeDateBoundary(30, "max");
    const wide = computeAgeDateBoundary(40, "max");
    expect(new Date(narrow).getTime()).toBeGreaterThan(new Date(wide).getTime());
  });

  it("creates narrower boundary for larger ageMin", () => {
    const young = computeAgeDateBoundary(20, "min");
    const old = computeAgeDateBoundary(40, "min");
    expect(new Date(young).getTime()).toBeGreaterThan(new Date(old).getTime());
  });
});
