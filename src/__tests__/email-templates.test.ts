import { expect, test, describe } from "bun:test";
import { getVerificationEmailHtml, getPasswordResetEmailHtml } from "@/lib/email-templates";

describe("Email Templates", () => {
  describe("getVerificationEmailHtml", () => {
    test("should generate valid HTML with user data", () => {
      const html = getVerificationEmailHtml(
        "Ahmad Jabir",
        "ahmad@example.com",
        "https://example.com/verify?token=abc123"
      );

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Ahmad Jabir");
      expect(html).toContain("https://example.com/verify?token=abc123");
      expect(html).toContain("Verifikasi Email");
      expect(html).toContain("Jodohkan");
    });

    test("should include correct year in footer", () => {
      const currentYear = new Date().getFullYear();
      const html = getVerificationEmailHtml("Test", "test@test.com", "https://example.com");

      expect(html).toContain(`© ${currentYear} Jodohkan`);
    });
  });

  describe("getPasswordResetEmailHtml", () => {
    test("should generate valid HTML with user data", () => {
      const html = getPasswordResetEmailHtml(
        "Siti Aisyah",
        "siti@example.com",
        "https://example.com/reset?token=xyz789"
      );

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Siti Aisyah");
      expect(html).toContain("https://example.com/reset?token=xyz789");
      expect(html).toContain("Reset Password");
      expect(html).toContain("Jodohkan");
    });

    test("should include expiration notice", () => {
      const html = getPasswordResetEmailHtml("Test", "test@test.com", "https://example.com");

      expect(html).toContain("1 jam");
      expect(html).toContain("link berikut");
    });
  });
});
