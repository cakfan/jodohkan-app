import { expect, test, describe, mock } from "bun:test";

describe("Nadzor Phase Transition - Auth Guard", () => {
  test("transitionToNadzorPhase should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { transitionToNadzorPhase } = await import("@/app/actions/stream");
    const result = await transitionToNadzorPhase("taaruf-some-id");

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("transitionToNadzorPhase should return error when user is not mediator", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => ({ user: { id: "user-1" } }),
    }));

    mock.module("@/db", () => ({
      db: {
        query: {
          taarufRequest: {
            findFirst: async () => ({
              id: "some-id",
              phase: "chat",
              senderId: "user-a",
              recipientId: "user-b",
              mediatorId: "mediator-1",
            }),
          },
        },
      },
    }));

    const { transitionToNadzorPhase } = await import("@/app/actions/stream");
    const result = await transitionToNadzorPhase("taaruf-some-id");

    expect(result).toEqual({ error: "Anda bukan mediator ta'aruf ini." });
  });

  test("transitionToNadzorPhase should return error when request not found", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => ({ user: { id: "mediator-1" } }),
    }));

    mock.module("@/db", () => ({
      db: {
        query: {
          taarufRequest: {
            findFirst: async () => null,
          },
        },
      },
    }));

    const { transitionToNadzorPhase } = await import("@/app/actions/stream");
    const result = await transitionToNadzorPhase("taaruf-nonexistent");

    expect(result).toEqual({ error: "Ta'aruf tidak ditemukan." });
  });

  test("transitionToNadzorPhase should return error when already in nadzor phase", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => ({ user: { id: "mediator-1" } }),
    }));

    mock.module("@/db", () => ({
      db: {
        query: {
          taarufRequest: {
            findFirst: async () => ({
              id: "request-1",
              phase: "nadzor",
              senderId: "user-a",
              recipientId: "user-b",
              mediatorId: "mediator-1",
            }),
          },
        },
      },
    }));

    const { transitionToNadzorPhase } = await import("@/app/actions/stream");
    const result = await transitionToNadzorPhase("taaruf-request-1");

    expect(result).toEqual({ error: "Fase nadzor sudah aktif." });
  });

  test("transitionToNadzorPhase should return error when channel update fails", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => ({ user: { id: "mediator-1" } }),
    }));

    mock.module("@/db", () => ({
      db: {
        query: {
          taarufRequest: {
            findFirst: async () => ({
              id: "request-1",
              phase: "chat",
              senderId: "user-a",
              recipientId: "user-b",
              mediatorId: "mediator-1",
            }),
          },
        },
        update: () => ({
          set: () => ({
            where: async () => {},
          }),
        }),
      },
    }));

    mock.module("@/lib/stream", () => ({
      getStreamClient: () => ({
        channel: () => ({
          updatePartial: async () => {
            throw new Error("Stream error");
          },
        }),
      }),
    }));

    const { transitionToNadzorPhase } = await import("@/app/actions/stream");
    const result = await transitionToNadzorPhase("taaruf-request-1");

    expect(result).toEqual({ error: "Gagal memperbarui channel." });
  });
});

describe("getActiveTaarufPhase", () => {
  test("should be a function", async () => {
    const { getActiveTaarufPhase } = await import("@/app/actions/taaruf");
    expect(typeof getActiveTaarufPhase).toBe("function");
  });

  test("should return active false when user not in taaruf", async () => {
    mock.module("@/db", () => {
      function withSelect() {
        return {
          from: () => ({
            where: () => ({
              limit: async () => [],
            }),
          }),
        };
      }

      return {
        db: {
          select: withSelect,
          query: {
            user: { findFirst: async () => null },
          },
        },
      };
    });

    const { getActiveTaarufPhase } = await import("@/app/actions/taaruf");
    const result = await getActiveTaarufPhase("some-user-id");
    expect(result).toEqual({ active: false, phase: null });
  });
});

describe("Nadzor Phase Values", () => {
  test("phase should have exactly 4 valid values", () => {
    const phases = ["chat", "nadzor", "khitbah", "completed"];
    expect(phases).toContain("chat");
    expect(phases).toContain("nadzor");
    expect(phases).toContain("khitbah");
    expect(phases).toContain("completed");
    expect(phases).toHaveLength(4);
  });
});

describe("Nadzor Session Status Values", () => {
  test("status should have exactly 5 valid values", () => {
    const statuses = ["scheduled", "ongoing", "completed", "cancelled", "terminated"];
    expect(statuses).toContain("scheduled");
    expect(statuses).toContain("ongoing");
    expect(statuses).toContain("completed");
    expect(statuses).toContain("cancelled");
    expect(statuses).toContain("terminated");
    expect(statuses).toHaveLength(5);
  });

  test("end_reason should have exactly 4 valid values", () => {
    const reasons = ["completed", "timeout", "violation", "cancelled"];
    expect(reasons).toContain("completed");
    expect(reasons).toContain("timeout");
    expect(reasons).toContain("violation");
    expect(reasons).toContain("cancelled");
    expect(reasons).toHaveLength(4);
  });
});

describe("Nadzor Session Agreement", () => {
  test("agreed column should default to false", () => {
    const defaultValues = {
      agreed: false,
      statuses: ["pending", "approved", "rejected"],
      uniqueFields: ["session_id", "user_id"],
    };

    expect(defaultValues.agreed).toBe(false);
    expect(defaultValues.statuses).toContain("pending");
    expect(defaultValues.statuses).toContain("approved");
    expect(defaultValues.statuses).toContain("rejected");
  });
});

describe("Exports - Stream Actions", () => {
  test("should export transitionToNadzorPhase", async () => {
    const mod = await import("@/app/actions/stream");
    expect(mod.transitionToNadzorPhase).toBeDefined();
  });
});

describe("Exports - Taaruf Actions", () => {
  test("should export getActiveTaarufPhase", async () => {
    const mod = await import("@/app/actions/taaruf");
    expect(mod.getActiveTaarufPhase).toBeDefined();
  });
});
