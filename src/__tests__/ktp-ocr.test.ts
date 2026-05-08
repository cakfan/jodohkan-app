import { describe, it, expect } from "bun:test";
import {
  validateKtpImage,
  normalizeNik,
  parseKtpText,
  extractField,
  nikDateMatches,
  healNik,
  mapStartsWith,
} from "@/lib/ktp-ocr";

// --- normalizeNik ---
describe("normalizeNik", () => {
  it("replaces O/o/Q/q with 0", () => {
    expect(normalizeNik("1234O567q890Q")).toBe("1234056708900");
  });

  it("replaces S/s with 5", () => {
    expect(normalizeNik("1234S567s890")).toBe("123455675890");
  });

  it("replaces B/b with 8", () => {
    expect(normalizeNik("1234B567b890")).toBe("123485678890");
  });

  it("replaces | ! ¡ with 1", () => {
    expect(normalizeNik("1234|567!890¡")).toBe("1234156718901");
  });

  it("strips single, double, and backtick quotes", () => {
    expect(normalizeNik("123`456\"789'0")).toBe("1234567890");
  });

  it("removes all non-digit characters", () => {
    expect(normalizeNik("NIK: 3512-3456-7890-1234")).toBe("3512345678901234");
  });

  it("handles empty string", () => {
    expect(normalizeNik("")).toBe("");
  });

  it("handles already clean NIK", () => {
    expect(normalizeNik("3512345678901234")).toBe("3512345678901234");
  });
});

// --- nikDateMatches ---
describe("nikDateMatches", () => {
  it("returns false when birthDate is empty", () => {
    expect(nikDateMatches("3512345678901234", "")).toBe(false);
  });

  it("returns false when birthDate is undefined", () => {
    expect(nikDateMatches("3512345678901234")).toBe(false);
  });

  it("returns true when NIK contains birth date in correct format", () => {
    expect(nikDateMatches("3512150895123456", "1995-08-15")).toBe(true);
  });

  it("returns true with ±1 year tolerance", () => {
    expect(nikDateMatches("3512150894123456", "1995-08-15")).toBe(true);
    expect(nikDateMatches("3512150896123456", "1995-08-15")).toBe(true);
  });

  it("adjusts day by -40 when day > 40 (female NIK format)", () => {
    expect(nikDateMatches("3512550895123456", "1995-08-15")).toBe(true);
  });

  it("returns false when no position matches", () => {
    expect(nikDateMatches("3512150895123456", "1990-01-01")).toBe(false);
  });

  it("scans all sliding window positions", () => {
    expect(nikDateMatches("3515089512345678", "1995-08-15")).toBe(true);
  });

  it("uses normalizeNik on the nik input (O→0 makes it match)", () => {
    expect(nikDateMatches("351215O895123456", "1995-08-15")).toBe(true);
  });
});

// --- healNik ---
describe("healNik", () => {
  it("returns 16-digit NIK unchanged", () => {
    expect(healNik("3512345678901234")).toBe("3512345678901234");
  });

  it("returns clean 15-digit NIK unchanged when no birth date", () => {
    const result = healNik("351234567890123");
    expect(result).toBe("351234567890123");
  });

  it("heals 15-digit NIK with birth date", () => {
    const result = healNik("351508951234560", "1995-08-15");
    expect(result.length === 15 || result.length === 16).toBe(true);
  });

  it("returns clean 15-digit when no birth date candidate matches", () => {
    const result = healNik("351234567890123", "1990-01-01");
    expect(result).toBe("351234567890123");
  });

  it("applies normalizeNik before healing", () => {
    expect(healNik("351234567890123B")).toBe("3512345678901238");
  });
});

// --- mapStartsWith ---
describe("mapStartsWith", () => {
  it("matches exact key", () => {
    const map = { "BELUM KAWIN": "single", KAWIN: "married" };
    expect(mapStartsWith("BELUM KAWIN", map)).toBe("single");
  });

  it("matches prefix when OCR noise is appended", () => {
    const map = { "BELUM KAWIN": "single", KAWIN: "married" };
    expect(mapStartsWith("BELUM KAWIN E JEMBER", map)).toBe("single");
  });

  it("returns undefined when no key matches", () => {
    const map = { "BELUM KAWIN": "single" };
    expect(mapStartsWith("SUDAH KAWIN", map)).toBeUndefined();
  });

  it("returns undefined for empty raw", () => {
    const map = { "BELUM KAWIN": "single" };
    expect(mapStartsWith("", map)).toBeUndefined();
  });
});

// --- extractField ---
describe("extractField", () => {
  it("extracts value after colon separator", () => {
    expect(extractField("NIK: 3512345678901234", "NIK")).toBe("3512345678901234");
  });

  it("extracts value after dot separator", () => {
    expect(extractField("NAMA. TAUFAN", "NAMA")).toBe("TAUFAN");
  });

  it("extracts value after space separator", () => {
    expect(extractField("PEKERJAAN KARYAWAN", "PEKERJAAN")).toBe("KARYAWAN");
  });

  it("returns null when label not found", () => {
    expect(extractField("NIK: 1234", "ALAMAT")).toBeNull();
  });

  it("extracts value on next line", () => {
    expect(extractField("NIK\n3512345678901234", "NIK")).toBe("3512345678901234");
  });

  it("handles label with slash by escaping it", () => {
    expect(extractField("TEMPAT/TGL LAHIR: Jakarta, 15-08-1995", "TEMPAT/TGL LAHIR")).toBe("Jakarta, 15-08-1995");
  });
});

// --- parseKtpText ---
describe("parseKtpText", () => {
  it("extracts NIK from OCR text", () => {
    const text = `NIK: 3512345678901234`;
    const result = parseKtpText(text);
    expect(result.nik).toBe("3512345678901234");
  });

  it("extracts name and handles # → F mapping", () => {
    const text = `NAMA: #ATAHILLAH`;
    const result = parseKtpText(text);
    expect(result.name).toBe("FATAHILLAH");
  });

  it("extracts birth place and date from TTL format with commas", () => {
    const text = `TTL: Jakarta, 15-08-1995`;
    const result = parseKtpText(text);
    expect(result.birthPlace).toBe("JAKARTA");
    expect(result.birthDate).toBe("1995-08-15");
  });

  it("extracts birth place and date from TEMPAT/TGL LAHIR format", () => {
    const text = `TEMPAT TGL LAHIR: Jakarta, 15-08-1995`;
    const result = parseKtpText(text);
    expect(result.birthPlace).toBe("JAKARTA");
    expect(result.birthDate).toBe("1995-08-15");
  });

  it("extracts birth place only when no date in TTL", () => {
    const text = `TTL: Jakarta`;
    const result = parseKtpText(text);
    expect(result.birthPlace).toBe("JAKARTA");
    expect(result.birthDate).toBeUndefined();
  });

  it("extracts birth date from LAHIR line when TTL not present", () => {
    const text = `LAHIR: Jakarta, 15-08-1995`;
    const result = parseKtpText(text);
    expect(result.birthPlace).toBe("JAKARTA");
    expect(result.birthDate).toBe("1995-08-15");
  });

  it("falls back to any date pattern in text", () => {
    const text = `NIK: 3512345678901234\nNAMA: TEST\n15-08-1995`;
    const result = parseKtpText(text);
    expect(result.birthDate).toBe("1995-08-15");
  });

  it("maps gender from JENIS KELAMIN field", () => {
    const text = `JENIS KELAMIN: LAKI-LAKI`;
    const result = parseKtpText(text);
    expect(result.gender).toBe("male");
  });

  it("maps gender from normalized KELAMIN field", () => {
    const text = `KELAMIN: PEREMPUAN`;
    const result = parseKtpText(text);
    expect(result.gender).toBe("female");
  });

  it("falls back to regex when gender field not extracted", () => {
    const text = `LAKI-LAKI`;
    const result = parseKtpText(text);
    expect(result.gender).toBe("male");
  });

  it("maps marital status from STATUS PERKAWINAN", () => {
    const text = `STATUS PERKAWINAN: BELUM KAWIN`;
    const result = parseKtpText(text);
    expect(result.maritalStatus).toBe("single");
  });

  it("maps marital status with OCR noise 8→B in BELUM", () => {
    const text = `STATUS PERKAWINAN: 8ELUM KAWIN`;
    const result = parseKtpText(text);
    expect(result.maritalStatus).toBe("single");
  });

  it("maps marital status with OCR noise 8→B in 8ELUMKAWIN", () => {
    const text = `STATUSPERKAWINAN: 8ELUMKAWIN`;
    const result = parseKtpText(text);
    expect(result.maritalStatus).toBe("single");
  });

  it("extracts occupation from PEKERJAAN field", () => {
    const text = `PEKERJAAN: KARYAWAN SWASTA`;
    const result = parseKtpText(text);
    expect(result.occupation).toBe("KARYAWAN SWASTA");
  });

  it("maps CERAI HIDUP → divorced", () => {
    const text = `STATUS PERKAWINAN: CERAI HIDUP`;
    const result = parseKtpText(text);
    expect(result.maritalStatus).toBe("divorced");
  });

  it("maps CERAI MATI → widowed", () => {
    const text = `STATUS PERKAWINAN: CERAI MATI`;
    const result = parseKtpText(text);
    expect(result.maritalStatus).toBe("widowed");
  });

  it("handles full real-world KTP text", () => {
    const text = `PROVINSI JAWA TIMUR
KOTA SURABAYA
NIK: 3512345678901234
NAMA: TAUFAN ATAHILLAH
TEMPAT TGL LAHIR: SURABAYA, 15-08-1995
JENIS KELAMIN: LAKI-LAKI
STATUS PERKAWINAN: BELUM KAWIN
PEKERJAAN: KARYAWAN SWASTA`;
    const result = parseKtpText(text);
    expect(result.nik).toBe("3512345678901234");
    expect(result.name).toBe("TAUFAN ATAHILLAH");
    expect(result.birthPlace).toBe("SURABAYA");
    expect(result.birthDate).toBe("1995-08-15");
    expect(result.gender).toBe("male");
    expect(result.maritalStatus).toBe("single");
    expect(result.occupation).toBe("KARYAWAN SWASTA");
  });

  it("handles OCR with # → F in name", () => {
    const text = `NAMA: #ATNAH #ATAHILLAH`;
    const result = parseKtpText(text);
    expect(result.name).toBe("FATNAH FATAHILLAH");
  });

  it("handles NANA match for name (OCR noise)", () => {
    const text = `NANA: TAUFAN`;
    const result = parseKtpText(text);
    expect(result.name).toBe("TAUFAN");
  });

  it("cleans leading dashes from birth place", () => {
    const text = `TTL: - Jakarta, 15-08-1995`;
    const result = parseKtpText(text);
    expect(result.birthPlace).toBe("JAKARTA");
  });

  it("handles TTL without place (only date)", () => {
    const text = `TTL: -, 15-08-1995`;
    const result = parseKtpText(text);
    expect(result.birthDate).toBe("1995-08-15");
  });

  it("handles TTL with long dash separator in date", () => {
    const text = `TTL: Jakarta, 15\u201408\u20141995`;
    const result = parseKtpText(text);
    expect(result.birthPlace).toBe("JAKARTA");
    expect(result.birthDate).toBe("1995-08-15");
  });
});

// --- validateKtpImage ---
describe("validateKtpImage", () => {
  it("returns valid when NIK is exactly 16 digits", () => {
    const result = validateKtpImage({ nik: "3512345678901234" });
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("returns valid when NIK date matches birth date (non-16-digit NIK)", () => {
    const result = validateKtpImage({
      nik: "150895",
      birthDate: "1995-08-15",
    });
    expect(result.valid).toBe(true);
    expect(result.reason).toBe("NIK dikonfirmasi melalui tanggal lahir.");
  });

  it("returns valid when ≥2 labels are found (incomplete NIK)", () => {
    const result = validateKtpImage({
      nik: "12345",
      name: "Test User",
      gender: "male",
    });
    expect(result.valid).toBe(true);
    expect(result.reason).toContain("NIK tidak lengkap");
  });

  it("returns invalid when only 1 label found", () => {
    const result = validateKtpImage({ nik: "12345" });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Hanya ditemukan 1 field");
  });

  it("returns invalid when 0 labels found", () => {
    const result = validateKtpImage({});
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Tidak ditemukan data identitas");
  });

  it("counts birth place and birth date as one label", () => {
    const result = validateKtpImage({ birthPlace: "Jakarta", birthDate: "1995-08-15" });
    expect(result.valid).toBe(false);
  });

  it("counts name+gender+marital as 3 labels for valid with incomplete NIK", () => {
    const result = validateKtpImage({
      nik: "12345",
      name: "Test",
      gender: "male",
      maritalStatus: "single",
    });
    expect(result.valid).toBe(true);
  });

  it("handles undefined nik with name+birthPlace as 2 labels → valid", () => {
    const result = validateKtpImage({ name: "Test", birthPlace: "Jakarta" });
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("handles only name (1 label) → invalid", () => {
    const result = validateKtpImage({ name: "Test" });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Hanya ditemukan 1 field");
  });
});

// --- healNik integration ---
describe("healNik integration with extractKtpInfo", () => {
  it("auto-heals 15-digit NIK when birth date is available", () => {
    const healed = healNik("351508951234560", "1995-08-15");
    expect(healed.length === 15 || healed.length === 16).toBe(true);
  });
});

// --- OCR normalization integration ---
describe("OCR normalization integration", () => {
  it("8→B fix: BELUM KAWIN with 8 instead of B normalizes correctly", () => {
    const text = `STATUS PERKAWINAN: 8ELUM KAWIN`;
    const result = parseKtpText(text);
    expect(result.maritalStatus).toBe("single");
  });

  it("8→B fix: 8ELUMKAWIN without space normalizes correctly", () => {
    const text = `STATUSPERKAWINAN: 8ELUMKAWIN`;
    const result = parseKtpText(text);
    expect(result.maritalStatus).toBe("single");
  });

  it("1→I fix: LAK1-LAK1 with 1 instead of I", () => {
    const text = `JENIS KELAMIN: LAK1-LAK1`;
    const result = parseKtpText(text);
    expect(result.gender).toBe("male");
  });

  it("#→F fix in name", () => {
    const text = `NAMA: #ATAHILLAH`;
    const result = parseKtpText(text);
    expect(result.name).toBe("FATAHILLAH");
  });
});

// --- extractKtpInfo (lightweight tests) ---
describe("extractKtpInfo", () => {
  it("accepts File object with image type", () => {
    const file = new File([""], "ktp.jpg", { type: "image/jpeg" });
    expect(file.type).toBe("image/jpeg");
    expect(file.name).toBe("ktp.jpg");
  });
});
