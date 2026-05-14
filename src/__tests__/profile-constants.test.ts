import { expect, test, describe } from "bun:test";
import { CV_STATUS_LABELS, MARITAL_LABELS, getMaritalLabel } from "@/lib/constants/profile";

describe("CV_STATUS_LABELS", () => {
  test("should have all expected status keys", () => {
    const keys = Object.keys(CV_STATUS_LABELS);
    expect(keys).toHaveLength(5);
    expect(keys).toContain("draft");
    expect(keys).toContain("pending");
    expect(keys).toContain("approved");
    expect(keys).toContain("published");
    expect(keys).toContain("rejected");
  });

  test("each status should have label, class, and dot properties", () => {
    for (const key of Object.keys(CV_STATUS_LABELS)) {
      expect(CV_STATUS_LABELS[key]).toHaveProperty("label");
      expect(CV_STATUS_LABELS[key]).toHaveProperty("class");
      expect(CV_STATUS_LABELS[key]).toHaveProperty("dot");
    }
  });

  test("draft should use muted colors", () => {
    expect(CV_STATUS_LABELS.draft.label).toBe("Draft");
    expect(CV_STATUS_LABELS.draft.class).toContain("muted");
    expect(CV_STATUS_LABELS.draft.dot).toContain("muted");
  });

  test("approved and published should use emerald colors", () => {
    expect(CV_STATUS_LABELS.approved.class).toContain("emerald");
    expect(CV_STATUS_LABELS.published.class).toContain("emerald");
    expect(CV_STATUS_LABELS.rejected.class).toContain("red");
  });
});

describe("MARITAL_LABELS", () => {
  test("should have correct marital status labels", () => {
    expect(MARITAL_LABELS.single).toBe("Belum Menikah");
    expect(MARITAL_LABELS.divorced).toBe("Pernah Menikah");
    expect(MARITAL_LABELS.widowed).toBe("Cerai Meninggal");
    expect(Object.keys(MARITAL_LABELS)).toHaveLength(3);
  });
});

describe("getMaritalLabel", () => {
  test("should return label for known status", () => {
    expect(getMaritalLabel("single")).toBe("Belum Menikah");
    expect(getMaritalLabel("divorced")).toBe("Pernah Menikah");
    expect(getMaritalLabel("widowed")).toBe("Cerai Meninggal");
  });

  test("should return dash for null or undefined", () => {
    expect(getMaritalLabel(null)).toBe("-");
    expect(getMaritalLabel(undefined)).toBe("-");
  });

  test("should return the input itself for unknown status", () => {
    expect(getMaritalLabel("unknown")).toBe("unknown");
    expect(getMaritalLabel("other")).toBe("other");
  });
});
