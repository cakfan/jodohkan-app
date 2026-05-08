import { recognize } from "tesseract.js";

export interface KtpValidation {
  valid: boolean;
  reason?: string;
}

export interface KtpExtractedData {
  nik?: string;
  name?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;
}

const genderMap: Record<string, string> = {
  "LAKI-LAKI": "male",
  "LAKILAKI": "male",
  LAKI: "male",
  L: "male",
  PEREMPUAN: "female",
  WANITA: "female",
  P: "female",
};

const maritalMap: Record<string, string> = {
  "BELUM KAWIN": "single",
  "BELUMKAWIN": "single",
  KAWIN: "married",
  MENIKAH: "married",
  "CERAI HIDUP": "divorced",
  "CERAIHIDUP": "divorced",
  "CERAI MATI": "widowed",
  "CERAINATI": "widowed",
};

function normalize(text: string): string {
  return text
    .replace(/[|!¡]/g, "")
    .replace(/[1]/g, "I")
    .replace(/[0OoQq]/g, "0")
    .replace(/[Ss\$5]/g, "5")
    .replace(/[Bb8]/g, "B")
    .replace(/[Ee3]/g, "E")
    .replace(/[Aa4]/g, "A")
    .replace(/[Gg6]/g, "G")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim().toUpperCase())
    .join("\n");
}

function extractField(text: string, label: string): string | null {
  const escaped = label.replace(/[/]/g, "\\/");
  const patterns = [
    new RegExp(`${escaped}\\s*[.:]\\s*([^\\n]+)`, "i"),
    new RegExp(`${escaped}\\s+([^\\n]+)`, "i"),
    new RegExp(`${escaped}[.:]?\\s*([^\\n]+)`, "i"),
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const val = m[1].trim().replace(/\s+/g, " ");
      if (val.length > 0) return val;
    }
  }
  return null;
}

function parseKtpText(raw: string): KtpExtractedData {
  const upper = raw.toUpperCase();

  const nik = cleanText(extractField(upper, "NIK"));
  const nameRaw = extractField(upper, "NAMA") ?? extractField(upper, "NANA");
  const name = cleanText(nameRaw?.replace(/#/g, "F"));

  function cleanBirthPlace(raw: string | null | undefined): string | undefined {
    const cleaned = cleanText(raw);
    if (!cleaned) return undefined;
    return cleaned
      .replace(/^[-–—\s]+/, "")
      .replace(/\s*[-–—]\s*\d+.*$/, "")
      .trim() || undefined;
  }

  let birthPlace: string | undefined;
  let birthDate: string | undefined;

  const ttlMatch = upper.match(
    /(?:TEMPAT\s*(?:\/|DAN)\s*T[GL][GLI1]\s*LAHIR|TEMPATT[GL][GLI1]\s*LAHIR|TEMPAT\s*LAHIR|T[GL][GLI1]\s*LAHIR|TTL)\s*[.:]?\s*([^\n]+)/
  );
  if (ttlMatch) {
    const rawTtl = ttlMatch[1].trim();
    const parts = rawTtl.split(/[,]/);
    if (parts.length >= 2) {
      birthPlace = cleanBirthPlace(parts[0]);
      const dateStr = parts.slice(1).join("-").trim();
      const dateMatch = dateStr.match(/(\d{1,2})\s*[-–—]?\s*(\d{1,2})\s*[-–—]?\s*(\d{4})/);
      if (dateMatch) {
        const [, d, m, y] = dateMatch;
        birthDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
    } else {
      birthPlace = cleanBirthPlace(rawTtl);
    }
  } else {
    const lahirLine = upper.match(/LAHIR[\s.:]*([^\n]+)/);
    if (lahirLine) {
      const raw = lahirLine[1].trim();
      const parts = raw.split(/[,]/);
      if (parts.length >= 2) {
        birthPlace = cleanBirthPlace(parts[0]);
        const dateStr = parts.slice(1).join("-").trim();
        const dateMatch = dateStr.match(/(\d{1,2})\s*[-–—]?\s*(\d{1,2})\s*[-–—]?\s*(\d{4})/);
        if (dateMatch) {
          const [, d, m, y] = dateMatch;
          birthDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
      } else {
        birthPlace = cleanBirthPlace(raw);
      }
    }
  }

  if (!birthDate) {
    const dateAnywhere = upper.match(/(\d{2})\s*[-–—]\s*(\d{2})\s*[-–—]\s*(\d{4})/);
    if (dateAnywhere) {
      const [, d, m, y] = dateAnywhere;
      birthDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }

  const normText = normalize(upper);

  const genderRaw = cleanText(
    extractField(normText, "JENIS KELAMIN") ??
    extractField(normText, "JENISKELAMIN") ??
    extractField(normText, "KELAMIN")
  );
  function mapStartsWith(raw: string, map: Record<string, string>): string | undefined {
    return map[raw] ?? map[Object.keys(map).find((k) => raw.startsWith(k)) as string];
  }

  const gender = genderRaw
    ? mapStartsWith(genderRaw, genderMap)
    : /LAKI[\s-]*LAKI/.test(normText) ? "male"
      : /PEREMPUAN|WANITA/.test(normText) ? "female"
        : undefined;

  const maritalRaw = cleanText(
    extractField(normText, "STATUS PERKAWINAN") ??
    extractField(normText, "STATUSPERKAWINAN") ??
    extractField(normText, "PERKAWINAN")
  );
  const maritalStatus = maritalRaw
    ? mapStartsWith(maritalRaw, maritalMap)
    : /BELUM[\s-]*KAWIN|BELUM[\s-]*MENIKAH/.test(normText) ? "single"
      : /CERAI[\s-]*HIDUP/.test(normText) ? "divorced"
        : /CERAI[\s-]*MATI|JANDA|DUDA/.test(normText) ? "widowed"
          : undefined;

  const occupation = cleanText(extractField(upper, "PEKERJAAN"));

  return { nik, name, birthPlace, birthDate, gender, maritalStatus, occupation };
}

function normalizeNik(raw: string): string {
  return raw
    .replace(/[OoQq]/g, "0")
    .replace(/[Ss]/g, "5")
    .replace(/[Bb]/g, "8")
    .replace(/[|!¡]/g, "1")
    .replace(/["'`"]/g, "")
    .replace(/[^0-9]/g, "");
}

function healNik(raw: string, birthDate?: string): string {
  const clean = normalizeNik(raw);
  if (clean.length === 16) return clean;
  if (clean.length !== 15) return clean;

  const candidates: string[] = [];
  for (let pos = 0; pos <= 15; pos++) {
    for (let digit = 0; digit <= 9; digit++) {
      const candidate = clean.slice(0, pos) + digit + clean.slice(pos);
      if (candidate.length === 16) candidates.push(candidate);
    }
  }

  if (birthDate) {
    const matching = candidates.filter((c) => nikDateMatches(c, birthDate));
    if (matching.length === 1) return matching[0];
  }

  return clean;
}

function nikDateMatches(nik: string, birthDate?: string): boolean {
  if (!birthDate) return false;
  const clean = normalizeNik(nik);
  const [bYear, bMonth, bDay] = birthDate.split("-").map(Number);
  const shortYear = bYear % 100;

  for (let i = 0; i <= clean.length - 6; i++) {
    const seq = clean.slice(i, i + 6);
    const nikDay = parseInt(seq.slice(0, 2), 10);
    const nikMonth = parseInt(seq.slice(2, 4), 10);
    const nikYear = parseInt(seq.slice(4, 6), 10);

    const adjustedDay = nikDay > 40 ? nikDay - 40 : nikDay;

    if (
      adjustedDay === bDay &&
      nikMonth === bMonth &&
      (nikYear === shortYear || nikYear === shortYear + 1 || nikYear === shortYear - 1)
    ) {
      return true;
    }
  }

  return false;
}

function cleanText(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  return raw
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[^\p{L}\p{N}]+$/u, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, " ")
    .trim() || undefined;
}

export function validateKtpImage(data: KtpExtractedData): KtpValidation {
  const nikClean = data.nik ? normalizeNik(data.nik) : "";

  if (nikClean.length === 16) {
    return { valid: true };
  }

  const nikDateOk = data.nik ? nikDateMatches(data.nik, data.birthDate) : false;
  if (nikDateOk) {
    return { valid: true, reason: "NIK dikonfirmasi melalui tanggal lahir." };
  }

  let labelCount = 0;
  if (data.nik) labelCount++;
  if (data.name) labelCount++;
  if (data.birthPlace || data.birthDate) labelCount++;
  if (data.gender) labelCount++;
  if (data.maritalStatus) labelCount++;

  if (labelCount >= 2) {
    return { valid: true, reason: nikClean ? "NIK tidak lengkap (harus 16 digit)" : undefined };
  }

  if (labelCount === 1) {
    return {
      valid: false,
      reason: "Foto tidak dikenali sebagai KTP. Hanya ditemukan 1 field. Silakan upload foto KTP yang jelas.",
    };
  }

  return {
    valid: false,
    reason: "Foto tidak dikenali sebagai KTP. Tidak ditemukan data identitas. Pastikan foto KTP terbaca dengan jelas.",
  };
}

export { normalizeNik };

export async function extractKtpInfo(file: File): Promise<KtpExtractedData> {
  const { data } = await recognize(file, "ind+eng", {
    logger: () => {},
  });

  const result = parseKtpText(data.text);

  if (result.nik) {
    const healed = healNik(result.nik, result.birthDate);
    if (healed.length === 16) {
      result.nik = healed;
    }
  }

  return result;
}
