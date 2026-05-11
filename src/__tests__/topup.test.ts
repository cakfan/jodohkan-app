import { expect, test, describe, mock } from "bun:test";

describe("TopUp Constants", () => {
  test("TOPDUP_OPTIONS should have exactly 4 pricing tiers", async () => {
    const { TOPUP_OPTIONS } = await import("@/lib/constants/topup");
    expect(TOPUP_OPTIONS).toHaveLength(4);
  });

  test("each option should have nominal, tokens, label, and desc", async () => {
    const { TOPUP_OPTIONS } = await import("@/lib/constants/topup");
    for (const opt of TOPUP_OPTIONS) {
      expect(opt.nominal).toBeGreaterThan(0);
      expect(opt.tokens).toBeGreaterThan(0);
      expect(typeof opt.label).toBe("string");
      expect(typeof opt.desc).toBe("string");
    }
  });

  test("pricing should match: Rp 10.000 = 10 token", async () => {
    const { TOPUP_OPTIONS } = await import("@/lib/constants/topup");
    const opt = TOPUP_OPTIONS.find((o: { nominal: number }) => o.nominal === 10000);
    expect(opt?.tokens).toBe(10);
    expect(opt?.label).toBe("Rp 10.000");
  });

  test("pricing should match: Rp 25.000 = 30 token", async () => {
    const { TOPUP_OPTIONS } = await import("@/lib/constants/topup");
    const opt = TOPUP_OPTIONS.find((o: { nominal: number }) => o.nominal === 25000);
    expect(opt?.tokens).toBe(30);
    expect(opt?.label).toBe("Rp 25.000");
  });

  test("pricing should match: Rp 50.000 = 65 token", async () => {
    const { TOPUP_OPTIONS } = await import("@/lib/constants/topup");
    const opt = TOPUP_OPTIONS.find((o: { nominal: number }) => o.nominal === 50000);
    expect(opt?.tokens).toBe(65);
    expect(opt?.label).toBe("Rp 50.000");
  });

  test("pricing should match: Rp 100.000 = 140 token", async () => {
    const { TOPUP_OPTIONS } = await import("@/lib/constants/topup");
    const opt = TOPUP_OPTIONS.find((o: { nominal: number }) => o.nominal === 100000);
    expect(opt?.tokens).toBe(140);
    expect(opt?.label).toBe("Rp 100.000");
  });

  test("INVOICE_DURATION_SECONDS should be 86400 (24 hours)", async () => {
    const { INVOICE_DURATION_SECONDS } = await import("@/lib/constants/topup");
    expect(INVOICE_DURATION_SECONDS).toBe(86400);
  });

  test("each tier should give more tokens per rupiah than the previous", async () => {
    const { TOPUP_OPTIONS } = await import("@/lib/constants/topup");
    for (let i = 1; i < TOPUP_OPTIONS.length; i++) {
      const prev = TOPUP_OPTIONS[i - 1].tokens / TOPUP_OPTIONS[i - 1].nominal;
      const curr = TOPUP_OPTIONS[i].tokens / TOPUP_OPTIONS[i].nominal;
      expect(curr).toBeGreaterThan(prev);
    }
  });
});

describe("getWalletBalance - Auth Guard", () => {
  test("should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { getWalletBalance } = await import("@/app/actions/topup");
    const result = await getWalletBalance();

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });
});

describe("createTopUpSession - Auth Guard", () => {
  test("should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { createTopUpSession } = await import("@/app/actions/topup");
    const result = await createTopUpSession(10000);

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });
});

describe("getPaymentStatus - Auth Guard", () => {
  test("should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { getPaymentStatus } = await import("@/app/actions/topup");
    const result = await getPaymentStatus("some-external-id");

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });
});

describe("TopUp Actions - Exports", () => {
  test("should export all required functions", async () => {
    const mod = await import("@/app/actions/topup");

    expect(mod.getWalletBalance).toBeDefined();
    expect(mod.createTopUpSession).toBeDefined();
    expect(mod.getPaymentStatus).toBeDefined();
  });
});

describe("verifyWebhookToken", () => {
  test("should return false for null token", async () => {
    const { verifyWebhookToken } = await import("@/lib/xendit");
    expect(verifyWebhookToken(null)).toBe(false);
  });

  test("should return false for undefined token", async () => {
    const { verifyWebhookToken } = await import("@/lib/xendit");
    expect(verifyWebhookToken(undefined)).toBe(false);
  });

  test("should return false for empty string token", async () => {
    const { verifyWebhookToken } = await import("@/lib/xendit");
    expect(verifyWebhookToken("")).toBe(false);
  });

  test("should throw when env var is not set", async () => {
    const { verifyWebhookToken } = await import("@/lib/xendit");
    const orig = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
    delete process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
    expect(() => verifyWebhookToken("some-token")).toThrow(
      "XENDIT_WEBHOOK_VERIFICATION_TOKEN belum diset"
    );
    process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN = orig;
  });
});
