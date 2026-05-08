import { expect, test, describe, mock } from "bun:test";

describe("Photo Upload - Validation", () => {
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  function validateFile(file: { type: string; size: number }): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Ukuran file maksimal 2MB.";
    }
    return null;
  }

  test("accepts JPEG file", () => {
    expect(validateFile({ type: "image/jpeg", size: 500 * 1024 })).toBeNull();
  });

  test("accepts PNG file", () => {
    expect(validateFile({ type: "image/png", size: 500 * 1024 })).toBeNull();
  });

  test("accepts WebP file", () => {
    expect(validateFile({ type: "image/webp", size: 500 * 1024 })).toBeNull();
  });

  test("rejects GIF file", () => {
    expect(validateFile({ type: "image/gif", size: 500 * 1024 })).toBe(
      "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
    );
  });

  test("rejects SVG file", () => {
    expect(validateFile({ type: "image/svg+xml", size: 500 * 1024 })).toBe(
      "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
    );
  });

  test("rejects PDF file", () => {
    expect(validateFile({ type: "application/pdf", size: 500 * 1024 })).toBe(
      "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
    );
  });

  test("rejects file larger than 2MB", () => {
    expect(validateFile({ type: "image/jpeg", size: 3 * 1024 * 1024 })).toBe(
      "Ukuran file maksimal 2MB."
    );
  });

  test("accepts file exactly at 2MB limit", () => {
    expect(validateFile({ type: "image/png", size: 2 * 1024 * 1024 })).toBeNull();
  });

  test("rejects file slightly over 2MB", () => {
    expect(validateFile({ type: "image/webp", size: 2 * 1024 * 1024 + 1 })).toBe(
      "Ukuran file maksimal 2MB."
    );
  });

  test("rejects file with no type", () => {
    expect(validateFile({ type: "", size: 100 * 1024 })).toBe(
      "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
    );
  });
});

describe("Photo Upload - Server Action Auth Guard", () => {
  test("uploadPhoto should return error when no session", async () => {
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

    const { uploadPhoto } = await import("@/app/actions/photo");
    const formData = new FormData();
    formData.append("photo", new File([""], "test.jpg", { type: "image/jpeg" }));
    const result = await uploadPhoto(formData);

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });

  test("uploadPhoto should return error when no file provided", async () => {
    mock.module("@/lib/auth", () => ({
      auth: {
        api: {
          getSession: async () => ({ user: { id: "test-user" } }),
        },
      },
    }));

    mock.module("next/headers", () => ({
      headers: async () => new Headers(),
    }));

    const { uploadPhoto } = await import("@/app/actions/photo");
    const result = await uploadPhoto(new FormData());

    expect(result).toEqual({ error: "Tidak ada file yang dipilih." });
  });

  test("deletePhoto should return error when no session", async () => {
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

    const { deletePhoto } = await import("@/app/actions/photo");
    const result = await deletePhoto();

    expect(result).toEqual({ error: "Sesi tidak ditemukan." });
  });
});
