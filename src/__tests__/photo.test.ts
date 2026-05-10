import { expect, test, describe, mock } from "bun:test";
import { validateImageFile } from "@/lib/constants/upload";

describe("Photo Upload - Validation", () => {
  test("accepts JPEG file", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 500 * 1024 } as File)).toBeNull();
  });

  test("accepts PNG file", () => {
    expect(validateImageFile({ type: "image/png", size: 500 * 1024 } as File)).toBeNull();
  });

  test("accepts WebP file", () => {
    expect(validateImageFile({ type: "image/webp", size: 500 * 1024 } as File)).toBeNull();
  });

  test("rejects GIF file", () => {
    expect(validateImageFile({ type: "image/gif", size: 500 * 1024 } as File)).toBe(
      "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
    );
  });

  test("rejects SVG file", () => {
    expect(validateImageFile({ type: "image/svg+xml", size: 500 * 1024 } as File)).toBe(
      "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
    );
  });

  test("rejects PDF file", () => {
    expect(validateImageFile({ type: "application/pdf", size: 500 * 1024 } as File)).toBe(
      "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
    );
  });

  test("rejects file larger than 2MB", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 3 * 1024 * 1024 } as File)).toBe(
      "Ukuran file maksimal 2MB."
    );
  });

  test("accepts file exactly at 2MB limit", () => {
    expect(validateImageFile({ type: "image/png", size: 2 * 1024 * 1024 } as File)).toBeNull();
  });

  test("rejects file slightly over 2MB", () => {
    expect(validateImageFile({ type: "image/webp", size: 2 * 1024 * 1024 + 1 } as File)).toBe(
      "Ukuran file maksimal 2MB."
    );
  });

  test("rejects file with no type", () => {
    expect(validateImageFile({ type: "", size: 100 * 1024 } as File)).toBe(
      "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
    );
  });
});

describe("Photo Upload - Server Action Auth Guard", () => {
  test("uploadPhoto should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { uploadPhoto } = await import("@/app/actions/photo");
    const formData = new FormData();
    formData.append("photo", new File([""], "test.jpg", { type: "image/jpeg" }));
    const result = await uploadPhoto(formData);

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("uploadPhoto should return error when no file provided", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => ({ user: { id: "test-user" } }),
    }));

    const { uploadPhoto } = await import("@/app/actions/photo");
    const result = await uploadPhoto(new FormData());

    expect(result).toEqual({ error: "Tidak ada file yang dipilih." });
  });

  test("deletePhoto should return error when no session", async () => {
    mock.module("@/lib/get-server-session", () => ({
      getServerSession: async () => null,
    }));

    const { deletePhoto } = await import("@/app/actions/photo");
    const result = await deletePhoto();

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });
});
