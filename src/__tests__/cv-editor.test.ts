import { expect, test, describe, mock } from "bun:test";

describe("CV Editor - Step Data Integrity", () => {
  const steps = [
    { number: 1, title: "Data Diri" },
    { number: 2, title: "Visi & Misi" },
    { number: 3, title: "Kriteria Pasangan" },
    { number: 4, title: "Pemahaman Agama" },
    { number: 5, title: "Q&A" },
  ];

  test("should have exactly 5 steps", () => {
    expect(steps).toHaveLength(5);
  });

  test("each step should have required fields", () => {
    for (const step of steps) {
      expect(step.number).toBeGreaterThan(0);
      expect(step.title).toBeTruthy();
    }
  });

  test("steps should be sequential 1-5", () => {
    const numbers = steps.map((s) => s.number);
    expect(numbers).toEqual([1, 2, 3, 4, 5]);
  });

  test("titles should be unique", () => {
    const titles = steps.map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("Profile Server Action - Auth Guard", () => {
  test("getProfile should return error when no session", async () => {
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

    const { getProfile } = await import("@/app/actions/profile");
    const result = await getProfile();

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("saveProfile should return error when no session", async () => {
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

    const { saveProfile } = await import("@/app/actions/profile");
    const result = await saveProfile({ gender: "male" });

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });
});
