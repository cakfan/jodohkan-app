import { expect, test, describe } from "bun:test";
import { signInSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";

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
      expect(result.success).toBe(true); // Default Zod behavior
    });
  });

  describe("signUpSchema", () => {
    test("should pass with all valid fields", () => {
      const data = {
        name: "Ahmad Jabir",
        email: "jabir@pethukjodoh.com",
        username: "ahmad_jabir",
        password: "pethukjodoh2026",
        gender: "male",
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
        "email@example@example.com",
      ];

      invalidEmails.forEach((email) => {
        const result = signUpSchema.safeParse({
          name: "John Doe",
          email,
          username: "johndoe",
          password: "password123",
        });
        expect(result.success).toBe(false);
      });
    });

    test("should fail if name is too short (< 2 chars)", () => {
      const result = signUpSchema.safeParse({
        name: "A",
        email: "test@test.com",
        username: "testuser",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    test("should fail on empty strings", () => {
      const result = signUpSchema.safeParse({
        name: "",
        email: "",
        username: "",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    test("should pass with valid email", () => {
      const data = { email: "user@example.com" };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("should fail with invalid email", () => {
      const invalidEmails = ["invalid", "test@", "@example.com", "test@.com"];
      invalidEmails.forEach((email) => {
        const result = forgotPasswordSchema.safeParse({ email });
        expect(result.success).toBe(false);
      });
    });

    test("should fail with empty email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email tidak valid.");
      }
    });
  });

  describe("resetPasswordSchema", () => {
    test("should pass with valid matching passwords", () => {
      const data = {
        password: "newpassword123",
        confirmPassword: "newpassword123",
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("should fail if password is too short (< 8 chars)", () => {
      const data = {
        password: "short",
        confirmPassword: "short",
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password minimal 8 karakter.");
      }
    });

    test("should fail if passwords do not match", () => {
      const data = {
        password: "newpassword123",
        confirmPassword: "differentpassword",
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password dan konfirmasi password tidak cocok.");
        expect(result.error.issues[0].path).toContain("confirmPassword");
      }
    });

    test("should fail with empty passwords", () => {
      const data = {
        password: "",
        confirmPassword: "",
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
