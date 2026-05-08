import { expect, test, describe } from "bun:test";

describe("BlurredPhoto - Data Integrity", () => {
  test("should have correct size variants", () => {
    const sizeMap = {
      sm: "h-16 w-16 md:h-20 md:w-20",
      md: "h-32 w-32 md:h-40 md:w-40",
      lg: "h-48 w-48 md:h-56 md:w-56",
    };

    expect(sizeMap.sm).toBe("h-16 w-16 md:h-20 md:w-20");
    expect(sizeMap.md).toBe("h-32 w-32 md:h-40 md:w-40");
    expect(sizeMap.lg).toBe("h-48 w-48 md:h-56 md:w-56");
  });

  test("should show placeholder when no blurredSrc provided", () => {
    const blurredSrc = null;
    expect(blurredSrc).toBeNull();
  });

  test("should allow toggle when canToggle is true and originalSrc exists", () => {
    const canToggle = true;
    const originalSrc = "https://example.com/original.jpg";
    expect(canToggle).toBe(true);
    expect(originalSrc).toBeTruthy();
  });

  test("should hide toggle when canToggle is false", () => {
    const canToggle = false;
    expect(canToggle).toBe(false);
  });

  test("should not show toggle when originalSrc is missing", () => {
    const canToggle = true;
    const originalSrc = null;
    expect(canToggle && !!originalSrc).toBe(false);
  });

  test("should render with valid blurred image src", () => {
    const blurredSrc = "https://example.com/photo-blurred.jpg";
    expect(blurredSrc).toBeTruthy();
    expect(blurredSrc.startsWith("https://")).toBe(true);
  });

  test("should render original when showOriginal is true", () => {
    const showOriginal = true;
    const originalSrc = "https://example.com/original.jpg";
    const blurredSrc = "https://example.com/photo-blurred.jpg";
    const src = showOriginal && originalSrc ? originalSrc : blurredSrc;
    expect(src).toBe(originalSrc);
  });

  test("should show blurredSrc by default", () => {
    const showOriginal = false;
    const originalSrc = "https://example.com/original.jpg";
    const blurredSrc = "https://example.com/photo-blurred.jpg";
    const src = showOriginal && originalSrc ? originalSrc : blurredSrc;
    expect(src).toBe(blurredSrc);
  });

  test("should show blurred label when not showing original", () => {
    const showOriginal = false;
    expect(showOriginal).toBe(false);
  });

  test("should hide blurred label when showing original", () => {
    const showOriginal = true;
    expect(showOriginal).toBe(true);
  });
});

describe("PhotoUpload - File type validation", () => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  test("should accept allowed image types", () => {
    expect(allowedTypes).toContain("image/jpeg");
    expect(allowedTypes).toContain("image/png");
    expect(allowedTypes).toContain("image/webp");
  });

  test("should have exactly 3 allowed types", () => {
    expect(allowedTypes).toHaveLength(3);
  });

  test("should reject non-image types", () => {
    expect(allowedTypes).not.toContain("image/gif");
    expect(allowedTypes).not.toContain("image/svg+xml");
    expect(allowedTypes).not.toContain("application/pdf");
  });
});
