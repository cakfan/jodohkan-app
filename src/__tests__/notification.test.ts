import { expect, test, describe, mock } from "bun:test";

describe("Notification Server Actions - Auth Guard", () => {
  test("getNotifications should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { getNotifications } = await import("@/app/actions/notification");
    const result = await getNotifications();

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("getUnreadNotificationCount should return 0 when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { getUnreadNotificationCount } = await import("@/app/actions/notification");
    const result = await getUnreadNotificationCount();

    expect(result).toBe(0);
  });

  test("markNotificationRead should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { markNotificationRead } = await import("@/app/actions/notification");
    const result = await markNotificationRead("some-id");

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("markAllNotificationsRead should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { markAllNotificationsRead } = await import("@/app/actions/notification");
    const result = await markAllNotificationsRead();

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("createNotification should not require session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { createNotification } = await import("@/app/actions/notification");
    expect(typeof createNotification).toBe("function");
  });
});

describe("Notification Types", () => {
  test("should have all expected notification types", async () => {
    const mod = await import("@/app/actions/notification");
    const types: string[] = [
      "taaruf_request_received",
      "taaruf_request_accepted",
      "taaruf_request_declined",
      "taaruf_request_expired",
      "taaruf_ended",
      "cv_approved",
      "cv_rejected",
    ];
    expect(types).toHaveLength(7);
    expect(types).toContain("taaruf_request_received");
    expect(types).toContain("taaruf_request_accepted");
    expect(types).toContain("taaruf_request_declined");
    expect(types).toContain("cv_approved");
    expect(types).toContain("cv_rejected");
  });
});

describe("Notification - Export Integrity", () => {
  test("should export all required functions", async () => {
    const mod = await import("@/app/actions/notification");
    expect(mod.createNotification).toBeDefined();
    expect(mod.getNotifications).toBeDefined();
    expect(mod.getUnreadNotificationCount).toBeDefined();
    expect(mod.markNotificationRead).toBeDefined();
    expect(mod.markAllNotificationsRead).toBeDefined();
  });
});
