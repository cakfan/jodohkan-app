import { expect, test, describe } from "bun:test";
import { getVerificationEmailHtml, getPasswordResetEmailHtml } from "@/lib/email-templates";
import { getNotificationEmailHtml, getDigestEmailHtml } from "@/lib/email-templates/notification";

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

  describe("getNotificationEmailHtml", () => {
    test("should generate valid HTML with title and body", () => {
      const html = getNotificationEmailHtml(
        "Permohonan Taaruf Baru",
        "Ahmad mengirimkan permohonan taaruf kepada Anda.",
        null,
        null
      );

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Permohonan Taaruf Baru");
      expect(html).toContain("Ahmad mengirimkan permohonan taaruf kepada Anda.");
      expect(html).toContain("Notifikasi Jodohkan");
      expect(html).toContain("Jodohkan");
    });

    test("should include action button when actionLabel and actionUrl provided", () => {
      const html = getNotificationEmailHtml(
        "CV Disetujui",
        "CV Anda telah disetujui.",
        "Lihat Profil",
        "https://jodohkan.app/profile"
      );

      expect(html).toContain("Lihat Profil");
      expect(html).toContain("https://jodohkan.app/profile");
      expect(html).not.toContain("Buka Notifikasi");
    });

    test("should not include action button when actionLabel is null", () => {
      const html = getNotificationEmailHtml(
        "Notifikasi",
        "Isi notifikasi.",
        null,
        null
      );

      expect(html).not.toContain("border-radius:8px;background:linear-gradient");
    });

    test("should include correct year in footer", () => {
      const currentYear = new Date().getFullYear();
      const html = getNotificationEmailHtml("Test", "Test body", null, null);

      expect(html).toContain(`© ${currentYear} Jodohkan`);
    });
  });

  describe("getDigestEmailHtml", () => {
    test("should generate valid HTML with multiple items", () => {
      const items = [
        { title: "Permohonan Taaruf", body: "Ahmad mengirimkan permohonan." },
        { title: "CV Disetujui", body: "CV Anda telah disetujui." },
      ];
      const html = getDigestEmailHtml(items, 2);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Ringkasan Aktivitas");
      expect(html).toContain("2 notifikasi");
      expect(html).toContain("Permohonan Taaruf");
      expect(html).toContain("Ahmad mengirimkan permohonan.");
      expect(html).toContain("CV Disetujui");
      expect(html).toContain("CV Anda telah disetujui.");
      expect(html).toContain("/notifications");
      expect(html).toContain("Jodohkan");
    });

    test("should handle single item", () => {
      const items = [{ title: "Notifikasi Baru", body: "Isi notifikasi." }];
      const html = getDigestEmailHtml(items, 1);

      expect(html).toContain("1 notifikasi");
      expect(html).toContain("Notifikasi Baru");
    });

    test("should handle empty items", () => {
      const html = getDigestEmailHtml([], 0);

      expect(html).toContain("0 notifikasi");
      expect(html).toContain("Ringkasan Aktivitas");
    });

    test("should include correct year in footer", () => {
      const currentYear = new Date().getFullYear();
      const html = getDigestEmailHtml([{ title: "T", body: "B" }], 1);

      expect(html).toContain(`© ${currentYear} Jodohkan`);
    });
  });
});
