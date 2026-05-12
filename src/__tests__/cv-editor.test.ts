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

describe("Step 1 - Data Diri Validation", () => {
  const validData = {
    gender: "male",
    birthDate: "1995-06-15",
    birthPlace: "Jakarta",
    ethnicity: "Jawa",
    height: 170,
    weight: 65,
    skinColor: "tan",
    hairColor: "Hitam",
    hairType: "lurus",
    maritalStatus: "single",
    faceAppearance: "Bulat",
    otherPhysicalTraits: "Berkacamata",
    country: "Indonesia",
    city: "Jakarta",
    occupation: "Engineer",
    education: "S1",
  };

  test("should pass with complete valid data", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test("should pass with photoUrl and photoBlurredUrl", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({
      ...validData,
      photoUrl: "https://example.com/original.jpg",
      photoBlurredUrl: "https://example.com/blurred.jpg",
      photoBlurred: true,
    });
    expect(result.success).toBe(true);
  });

  test("should pass with photo fields as null", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({
      ...validData,
      photoUrl: null,
      photoBlurredUrl: null,
      photoBlurred: false,
    });
    expect(result.success).toBe(true);
  });

  test("should fail with invalid photoUrl", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({
      ...validData,
      photoUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  test("should fail with invalid photoBlurredUrl", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({
      ...validData,
      photoBlurredUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  test("should pass with optional fields omitted", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const { gender, birthDate, birthPlace, ethnicity, hairColor, faceAppearance, otherPhysicalTraits, maritalStatus, country, city, occupation, education } = validData;
    const result = step1Schema.safeParse({ gender, birthDate, birthPlace, ethnicity, hairColor, faceAppearance, otherPhysicalTraits, maritalStatus, country, city, occupation, education });
    expect(result.success).toBe(true);
  });

  test("should pass when numeric fields are null", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, height: null, weight: null });
    expect(result.success).toBe(true);
  });

  test("should pass when gender is omitted (optional)", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const { gender: _, ...rest } = validData;
    void _;
    const result = step1Schema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  test("should fail when birthDate is empty", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, birthDate: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("birthDate");
    }
  });

  test("should fail when maritalStatus is empty", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, maritalStatus: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when country is empty", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, country: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when city is empty", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, city: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when occupation is empty", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, occupation: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when education is empty", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, education: "" });
    expect(result.success).toBe(false);
  });

  test("should fail with negative height", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, height: -10 });
    expect(result.success).toBe(false);
  });

  test("should fail with zero height", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, height: 0 });
    expect(result.success).toBe(false);
  });

  test("should fail with negative weight", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({ ...validData, weight: -5 });
    expect(result.success).toBe(false);
  });

  test("should fail with all required fields missing", async () => {
    const { step1Schema } = await import("@/lib/validations/profile");
    const result = step1Schema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(7);
    }
  });
});

describe("Step 2 - Visi & Misi Validation", () => {
  const validData = {
    bio: "A brief background about myself.",
    vision: "My life vision for building a family.",
    mission: "My mission in marriage.",
  };

  test("should pass with complete valid data", async () => {
    const { step2Schema } = await import("@/lib/validations/profile");
    const result = step2Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test("should fail when bio is empty", async () => {
    const { step2Schema } = await import("@/lib/validations/profile");
    const result = step2Schema.safeParse({ ...validData, bio: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when vision is empty", async () => {
    const { step2Schema } = await import("@/lib/validations/profile");
    const result = step2Schema.safeParse({ ...validData, vision: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when mission is empty", async () => {
    const { step2Schema } = await import("@/lib/validations/profile");
    const result = step2Schema.safeParse({ ...validData, mission: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when bio exceeds 5000 characters", async () => {
    const { step2Schema } = await import("@/lib/validations/profile");
    const result = step2Schema.safeParse({ ...validData, bio: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  test("should pass when bio is exactly 5000 characters", async () => {
    const { step2Schema } = await import("@/lib/validations/profile");
    const result = step2Schema.safeParse({ ...validData, bio: "a".repeat(5000) });
    expect(result.success).toBe(true);
  });

  test("should fail when vision exceeds 5000 characters", async () => {
    const { step2Schema } = await import("@/lib/validations/profile");
    const result = step2Schema.safeParse({ ...validData, vision: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  test("should fail when mission exceeds 5000 characters", async () => {
    const { step2Schema } = await import("@/lib/validations/profile");
    const result = step2Schema.safeParse({ ...validData, mission: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  test("should fail when all fields are empty", async () => {
    const { step2Schema } = await import("@/lib/validations/profile");
    const result = step2Schema.safeParse({ bio: "", vision: "", mission: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBe(3);
    }
  });
});

describe("Step 3 - Kriteria Pasangan Validation", () => {
  const validStep3 = {
    partnerCriteria: "I am looking for someone who is religious and kind.",
    partnerCity: "Jakarta",
    partnerOccupation: "Engineer",
  };

  test("should pass with valid data", async () => {
    const { step3Schema } = await import("@/lib/validations/profile");
    const result = step3Schema.safeParse(validStep3);
    expect(result.success).toBe(true);
  });

  test("should fail when partnerCriteria is empty", async () => {
    const { step3Schema } = await import("@/lib/validations/profile");
    const result = step3Schema.safeParse({ ...validStep3, partnerCriteria: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when partnerCity is empty", async () => {
    const { step3Schema } = await import("@/lib/validations/profile");
    const result = step3Schema.safeParse({ ...validStep3, partnerCity: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when partnerOccupation is empty", async () => {
    const { step3Schema } = await import("@/lib/validations/profile");
    const result = step3Schema.safeParse({ ...validStep3, partnerOccupation: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when partnerCriteria exceeds 10000 characters", async () => {
    const { step3Schema } = await import("@/lib/validations/profile");
    const result = step3Schema.safeParse({ ...validStep3, partnerCriteria: "a".repeat(10001) });
    expect(result.success).toBe(false);
  });

  test("should pass when partnerCriteria is exactly 10000 characters", async () => {
    const { step3Schema } = await import("@/lib/validations/profile");
    const result = step3Schema.safeParse({ ...validStep3, partnerCriteria: "a".repeat(10000) });
    expect(result.success).toBe(true);
  });
});

describe("Step 4 - Pemahaman Agama Validation", () => {
  const validData = {
    religiousUnderstanding: "I study Islam regularly.",
    manhaj: "Ahlus Sunnah wal Jama'ah",
    memorization: "I have memorized 5 juz.",
    dailyWorship: "I pray tahajjud and fast sunnah.",
  };

  test("should pass with complete valid data", async () => {
    const { step4Schema } = await import("@/lib/validations/profile");
    const result = step4Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test("should fail when religiousUnderstanding is empty", async () => {
    const { step4Schema } = await import("@/lib/validations/profile");
    const result = step4Schema.safeParse({ ...validData, religiousUnderstanding: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when manhaj is empty", async () => {
    const { step4Schema } = await import("@/lib/validations/profile");
    const result = step4Schema.safeParse({ ...validData, manhaj: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when memorization is empty", async () => {
    const { step4Schema } = await import("@/lib/validations/profile");
    const result = step4Schema.safeParse({ ...validData, memorization: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when dailyWorship is empty", async () => {
    const { step4Schema } = await import("@/lib/validations/profile");
    const result = step4Schema.safeParse({ ...validData, dailyWorship: "" });
    expect(result.success).toBe(false);
  });

  test("should fail when religiousUnderstanding exceeds 10000 chars", async () => {
    const { step4Schema } = await import("@/lib/validations/profile");
    const result = step4Schema.safeParse({ ...validData, religiousUnderstanding: "a".repeat(10001) });
    expect(result.success).toBe(false);
  });

  test("should pass when religiousUnderstanding is exactly 10000 chars", async () => {
    const { step4Schema } = await import("@/lib/validations/profile");
    const result = step4Schema.safeParse({ ...validData, religiousUnderstanding: "a".repeat(10000) });
    expect(result.success).toBe(true);
  });
});

describe("Step 5 - Q&A Validation", () => {
  test("should pass with at least one valid QA item", async () => {
    const { step5Schema } = await import("@/lib/validations/profile");
    const result = step5Schema.safeParse({
      qa: [{ question: "What is your goal?", answer: "To build a sakinah family." }],
    });
    expect(result.success).toBe(true);
  });

  test("should pass with multiple QA items", async () => {
    const { step5Schema } = await import("@/lib/validations/profile");
    const result = step5Schema.safeParse({
      qa: [
        { question: "Q1?", answer: "A1" },
        { question: "Q2?", answer: "A2" },
        { question: "Q3?", answer: "A3" },
      ],
    });
    expect(result.success).toBe(true);
  });

  test("should fail when QA array is empty", async () => {
    const { step5Schema } = await import("@/lib/validations/profile");
    const result = step5Schema.safeParse({ qa: [] });
    expect(result.success).toBe(false);
  });

  test("should fail when question is empty", async () => {
    const { step5Schema } = await import("@/lib/validations/profile");
    const result = step5Schema.safeParse({
      qa: [{ question: "", answer: "Some answer" }],
    });
    expect(result.success).toBe(false);
  });

  test("should fail when answer is empty", async () => {
    const { step5Schema } = await import("@/lib/validations/profile");
    const result = step5Schema.safeParse({
      qa: [{ question: "Some question?", answer: "" }],
    });
    expect(result.success).toBe(false);
  });

  test("should fail when both question and answer are empty", async () => {
    const { step5Schema } = await import("@/lib/validations/profile");
    const result = step5Schema.safeParse({
      qa: [{ question: "", answer: "" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBe(2);
    }
  });
});

describe("Profile Server Action - Auth Guard", () => {
  test(
    "getProfile should return error when no session",
    async () => {
      mock.module("@/lib/get-server-session", () => ({
        getServerSession: async () => null,
      }));

      const { getProfile } = await import("@/app/actions/profile");
      const result = await getProfile();

      expect(result).toEqual({ error: "Sesi tidak ditemukan." });
    },
    { timeout: 15000 },
  );

  test("saveProfile should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { saveProfile } = await import("@/app/actions/profile");
    const result = await saveProfile({ gender: "male" });

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });
});
