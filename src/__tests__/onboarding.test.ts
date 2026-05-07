import { expect, test, describe, mock } from "bun:test";

interface AdabItem {
  number: number;
  icon: unknown;
  title: string;
  description: string;
}

const adabItems: AdabItem[] = [
  {
    number: 1,
    icon: "Heart",
    title: "Niat yang Lurus",
    description:
      "Memulai ta'aruf dengan niat karena Allah سُبْحَانَهُ وَتَعَالَىٰ, bukan karena faktor fisik atau duniawi semata. Niat yang ikhlas menjadi fondasi keberkahan di setiap langkah.",
  },
  {
    number: 2,
    icon: "Eye",
    title: "Menjaga Pandangan",
    description:
      "Tidak melihat calon pasangan secara berlebihan. Foto akan diburamkan secara default dan hanya dapat dibuka saat tahap Nazhar dengan persetujuan bersama.",
  },
  {
    number: 3,
    icon: "Users",
    title: "Didampingi Mediator",
    description:
      "Setiap komunikasi selalu melibatkan mediator (murabbi/wali/ustadz) untuk menjaga adab, memberikan nasihat, dan memastikan proses berjalan sesuai syariat.",
  },
  {
    number: 4,
    icon: "BookText",
    title: "Fokus pada Visi Hidup",
    description:
      "Pertukaran informasi difokuskan pada visi berumah tangga, pemahaman agama, dan kesiapan mental. Bukan pada hal-hal duniawi yang tidak esensial.",
  },
];

const commitmentText =
  "Saya berkomitmen untuk mengikuti aturan syar'i dalam proses ta'aruf di platform ini. Saya memahami bahwa Pethuk Jodoh adalah wasilah (perantara) dan keberhasilannya kembali kepada Allah سُبْحَانَهُ وَتَعَالَىٰ. Saya akan menjaga adab, kejujuran, dan keseriusan dalam setiap tahapan.";

describe("Adab List Data Integrity", () => {
  test("should have exactly 4 items", () => {
    expect(adabItems).toHaveLength(4);
  });

  test("each item should have required fields", () => {
    for (const item of adabItems) {
      expect(item.number).toBeGreaterThan(0);
      expect(item.title).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(item.description.length).toBeGreaterThan(10);
    }
  });

  test("numbers should be sequential 1-4", () => {
    const numbers = adabItems.map((item) => item.number);
    expect(numbers).toEqual([1, 2, 3, 4]);
  });

  test("titles should be unique", () => {
    const titles = adabItems.map((item) => item.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  test("each description should end with sentence punctuation", () => {
    for (const item of adabItems) {
      expect(item.description.endsWith(".")).toBe(true);
    }
  });
});

describe("Commitment Text Integrity", () => {
  test("should be a non-empty string", () => {
    expect(commitmentText.length).toBeGreaterThan(0);
  });

  test("should contain key phrases", () => {
    expect(commitmentText).toContain("komitmen");
    expect(commitmentText).toContain("syar'i");
    expect(commitmentText).toContain("wasilah");
    expect(commitmentText).toContain("adab");
    expect(commitmentText).toContain("kejujuran");
    expect(commitmentText).toContain("keseriusan");
    expect(commitmentText).toContain("Allah سُبْحَانَهُ وَتَعَالَىٰ");
  });

  test("should start with Saya berkomitmen", () => {
    expect(commitmentText.startsWith("Saya berkomitmen")).toBe(true);
  });
});

describe("completeOnboarding - Auth Guard", () => {
  test("should return error when session is null", async () => {
    mock.module("@/lib/auth", () => ({
      auth: {
        api: {
          getSession: async () => null,
        },
      },
    }));

    mock.module("next/headers", () => ({
      headers: async () => new Headers(),
    }));

    const { completeOnboarding } = await import("@/app/actions/onboarding");
    const result = await completeOnboarding();

    expect(result).toEqual({
      error: "Sesi tidak ditemukan. Silakan masuk kembali.",
    });
  });

  test("should return error when session user has no id", async () => {
    mock.module("@/lib/auth", () => ({
      auth: {
        api: {
          getSession: async () => ({
            user: { id: null },
            session: {},
          }),
        },
      },
    }));

    mock.module("next/headers", () => ({
      headers: async () => new Headers(),
    }));

    const { completeOnboarding } = await import("@/app/actions/onboarding");
    const result = await completeOnboarding();

    expect(result).toEqual({
      error: "Sesi tidak ditemukan. Silakan masuk kembali.",
    });
  });
});

describe("Database Schema Definitions", () => {
  test("profile schema should have expected columns", async () => {
    const { profile } = await import("@/db/schema/profiles-schema");
    const columns = Object.keys(profile);
    expect(columns).toContain("id");
    expect(columns).toContain("userId");
    expect(columns).toContain("gender");
    expect(columns).toContain("bio");
    expect(columns).toContain("partnerCriteria");
    expect(columns).toContain("photoBlurred");
    expect(columns).toContain("onboardingCompleted");
  });

  test("mediator schema should have expected columns", async () => {
    const { mediator } = await import("@/db/schema/mediators-schema");
    const columns = Object.keys(mediator);
    expect(columns).toContain("id");
    expect(columns).toContain("userId");
    expect(columns).toContain("certificate");
    expect(columns).toContain("isVerified");
    expect(columns).toContain("maxActiveSessions");
  });

  test("wallet and tokenTransaction schemas should have expected columns", async () => {
    const { wallet, tokenTransaction } = await import("@/db/schema/wallets-schema");
    const walletCols = Object.keys(wallet);
    expect(walletCols).toContain("id");
    expect(walletCols).toContain("userId");
    expect(walletCols).toContain("balance");

    const txCols = Object.keys(tokenTransaction);
    expect(txCols).toContain("id");
    expect(txCols).toContain("userId");
    expect(txCols).toContain("type");
    expect(txCols).toContain("amount");
  });
});
