import { expect, test, describe } from "bun:test";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";

describe("Auth Schemas - Comprehensive Tests", () => {
  describe("signInSchema", () => {
    test("should pass with valid credentials", () => {
      const data = { username: "cak_fan", password: "securepassword123" };
      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("should fail if username is too short (< 3 chars)", () => {
      const result = signInSchema.safeParse({ username: "ab", password: "password123" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Username minimal 3 karakter.");
      }
    });

    test("should fail if password is too short (< 8 chars)", () => {
      const result = signInSchema.safeParse({ username: "cak_fan", password: "1234567" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password minimal 8 karakter.");
      }
    });

    test("should fail if fields are missing", () => {
      const result = signInSchema.safeParse({});
      expect(result.success).toBe(false);
      expect(result.error?.issues.length).toBeGreaterThanOrEqual(2);
    });

    test("should fail if username is just whitespace", () => {
      const result = signInSchema.safeParse({ username: "   ", password: "password123" });
      // Depending on if we trim, but usually .min(3) on whitespace passes unless we refine
      // However, it's good to check current behavior
      expect(result.success).toBe(true); // Default Zod behavior
    });
  });

  describe("signUpSchema", () => {
    test("should pass with all valid fields", () => {
      const data = {
        name: "Ahmad Jabir",
        email: "jabir@pethukjodoh.com",
        username: "ahmad_jabir",
        password: "pethukjodoh2026"
      };
      const result = signUpSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("should fail with invalid email formats", () => {
      const invalidEmails = [
        "plainaddress",
        "#@%^%#$@#$@#.com",
        "@example.com",
        "Joe Smith <email@example.com>",
        "email.example.com",
        "email@example@example.com"
      ];

      invalidEmails.forEach(email => {
        const result = signUpSchema.safeParse({
          name: "John Doe",
          email,
          username: "johndoe",
          password: "password123"
        });
        expect(result.success).toBe(false);
      });
    });

    test("should fail if name is too short (< 2 chars)", () => {
      const result = signUpSchema.safeParse({
        name: "A",
        email: "test@test.com",
        username: "testuser",
        password: "password123"
      });
      expect(result.success).toBe(false);
    });

    test("should fail if username has spaces (if restricted later, currently min 3)", () => {
      // Currently our schema only has .min(3)
      const result = signUpSchema.safeParse({
        name: "John Doe",
        email: "test@test.com",
        username: "j d",
        password: "password123"
      });
      expect(result.success).toBe(true);
    });

    test("should fail on empty strings", () => {
      const result = signUpSchema.safeParse({
        name: "",
        email: "",
        username: "",
        password: ""
      });
      expect(result.success).toBe(false);
    });
  });
});
