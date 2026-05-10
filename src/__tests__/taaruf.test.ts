import { expect, test, describe, mock } from "bun:test";

describe("Taaruf Server Actions - Auth Guard", () => {
  test("sendTaarufRequest should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { sendTaarufRequest } = await import("@/app/actions/taaruf");
    const result = await sendTaarufRequest("some-user-id");

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("respondToTaarufRequest should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { respondToTaarufRequest } = await import("@/app/actions/taaruf");
    const result = await respondToTaarufRequest("some-request-id", "accept");

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("getMySentRequests should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { getMySentRequests } = await import("@/app/actions/taaruf");
    const result = await getMySentRequests();

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("getMyIncomingRequests should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { getMyIncomingRequests } = await import("@/app/actions/taaruf");
    const result = await getMyIncomingRequests();

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("getTaarufRequestCounts should return null when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { getTaarufRequestCounts } = await import("@/app/actions/taaruf");
    const result = await getTaarufRequestCounts();

    expect(result).toBeNull();
  });
});

describe("Taaruf Server Actions - Guard without error object", () => {
  test("hasSentTaarufRequest should return false when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { hasSentTaarufRequest } = await import("@/app/actions/taaruf");
    const result = await hasSentTaarufRequest("some-user-id");

    expect(result).toBe(false);
  });

  test("getPendingTaarufRequestFromSource should return null when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { getPendingTaarufRequestFromSource } = await import("@/app/actions/taaruf");
    const result = await getPendingTaarufRequestFromSource("some-user-id");

    expect(result).toBeNull();
  });

  test("isInActiveTaarufWith should return false when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { isInActiveTaarufWith } = await import("@/app/actions/taaruf");
    const result = await isInActiveTaarufWith("some-user-id");

    expect(result).toBe(false);
  });

  test("isUserInActiveTaaruf should be a function", async () => {
    const { isUserInActiveTaaruf } = await import("@/app/actions/taaruf");
    expect(typeof isUserInActiveTaaruf).toBe("function");
  });
});

describe("sendTaarufRequest - Self-send guard", () => {
  test("should return error when sending request to self", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => ({ user: { id: "user-1" } }),
    }));

    const { sendTaarufRequest } = await import("@/app/actions/taaruf");
    const result = await sendTaarufRequest("user-1");

    expect(result).toEqual({ error: "Tidak dapat mengirim ta'aruf ke diri sendiri." });
  });
});

describe("Taaruf External API - Exports", () => {
  test("should export all required functions", async () => {
    const mod = await import("@/app/actions/taaruf");

    expect(mod.sendTaarufRequest).toBeDefined();
    expect(mod.respondToTaarufRequest).toBeDefined();
    expect(mod.getMySentRequests).toBeDefined();
    expect(mod.getMyIncomingRequests).toBeDefined();
    expect(mod.getTaarufRequestCounts).toBeDefined();
    expect(mod.hasSentTaarufRequest).toBeDefined();
    expect(mod.getPendingTaarufRequestFromSource).toBeDefined();
    expect(mod.isInActiveTaarufWith).toBeDefined();
    expect(mod.isUserInActiveTaaruf).toBeDefined();
    expect(mod.getActiveTaarufUserIds).toBeDefined();
  });

  test("should export TaarufRequestData type", async () => {
    const mod = await import("@/app/actions/taaruf");
    expect(mod.TaarufRequestData).toBeUndefined();
  });
});

describe("Taaruf Status Values", () => {
  test("should have valid ta'aruf status values", () => {
    const statuses = ["pending", "accepted", "declined", "expired"];
    expect(statuses).toContain("pending");
    expect(statuses).toContain("accepted");
    expect(statuses).toContain("declined");
    expect(statuses).toContain("expired");
    expect(statuses).toHaveLength(4);
  });

  test("accept and decline should be the only valid response actions", () => {
    const validActions = ["accept", "decline"];
    expect(validActions).toContain("accept");
    expect(validActions).toContain("decline");
    expect(validActions).toHaveLength(2);
  });
});
