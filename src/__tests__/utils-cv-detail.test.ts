import { expect, test, describe } from "bun:test";
import { buildPartnerCriteriaDescription } from "@/lib/utils-cv-detail";

describe("buildPartnerCriteriaDescription", () => {
  test("should return null when all inputs are empty", () => {
    expect(buildPartnerCriteriaDescription()).toBeNull();
    expect(buildPartnerCriteriaDescription(null, null, null, null, null)).toBeNull();
    expect(buildPartnerCriteriaDescription(undefined, undefined, undefined, undefined, undefined)).toBeNull();
  });

  test("should include city when provided", () => {
    const result = buildPartnerCriteriaDescription("Jakarta");
    expect(result).toContain("Domisili: Jakarta");
  });

  test("should include age range when both min and max provided", () => {
    const result = buildPartnerCriteriaDescription(null, 20, 30);
    expect(result).toContain("Usia: 20-30 tahun");
    expect(result).not.toContain("min");
    expect(result).not.toContain("max");
  });

  test("should include age min only when only min provided", () => {
    const result = buildPartnerCriteriaDescription(null, 20);
    expect(result).toContain("Usia min: 20 tahun");
  });

  test("should include age max only when only max provided", () => {
    const result = buildPartnerCriteriaDescription(null, null, 35);
    expect(result).toContain("Usia max: 35 tahun");
  });

  test("should include partner criteria when provided", () => {
    const result = buildPartnerCriteriaDescription(null, null, null, "S1");
    expect(result).toContain("Pendidikan: S1");
  });

  test("should include occupation when provided", () => {
    const result = buildPartnerCriteriaDescription(null, null, null, null, "Dokter");
    expect(result).toContain("Pekerjaan: Dokter");
  });

  test("should combine multiple fields with separator", () => {
    const result = buildPartnerCriteriaDescription("Bandung", 25, 35, "S2", "Arsitek");
    expect(result).toBe("Domisili: Bandung | Usia: 25-35 tahun | Pendidikan: S2 | Pekerjaan: Arsitek");
  });

  test("should handle partial combinations", () => {
    const result = buildPartnerCriteriaDescription(null, 18, null, "D3");
    expect(result).toBe("Usia min: 18 tahun | Pendidikan: D3");
  });
});
