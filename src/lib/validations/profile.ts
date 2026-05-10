import * as z from "zod";

const qaItemSchema = z.object({
  question: z.string().min(1, "Pertanyaan tidak boleh kosong"),
  answer: z.string().min(1, "Jawaban tidak boleh kosong"),
});

export const step1Schema = z.object({
  gender: z.string().optional(),
  birthDate: z.string().min(1, "Masukkan tanggal lahir"),
  birthPlace: z.string().min(1, "Masukkan tempat lahir"),
  ethnicity: z.string().min(1, "Masukkan suku"),
  height: z.coerce.number().positive("Tinggi badan tidak valid").max(250, "Tinggi badan maksimal 250 cm").nullable().optional(),
  weight: z.coerce.number().positive("Berat badan tidak valid").max(300, "Berat badan maksimal 300 kg").nullable().optional(),
  skinColor: z.enum(["", "white", "fair", "tan", "brown", "dark"]).optional(),
  maritalStatus: z.string().min(1, "Pilih status pernikahan"),
  childCount: z.coerce.number().int("Jumlah anak harus bilangan bulat").min(0, "Jumlah anak tidak valid").max(30, "Jumlah anak maksimal 30").nullable().optional(),
  hairColor: z.string().min(1, "Masukkan warna rambut"),
  hairType: z.enum(["", "lurus", "bergelombang", "keriting", "ikal"]).optional(),
  hijabStatus: z.string().optional(),
  faceAppearance: z.string().min(1, "Masukkan penampilan wajah"),
  otherPhysicalTraits: z.string().min(1, "Isi ciri fisik lainnya"),
  country: z.string().min(1, "Masukkan negara"),
  city: z.string().min(1, "Masukkan kota/domisili"),
  occupation: z.string().min(1, "Masukkan pekerjaan"),
  education: z.string().min(1, "Masukkan pendidikan"),
  photoUrl: z.string().url("URL foto tidak valid").nullable().optional(),
  photoBlurredUrl: z.string().url("URL foto tidak valid").nullable().optional(),
  photoBlurred: z.boolean().optional(),
});

export const step2Schema = z.object({
  bio: z
    .string()
    .min(1, "Isi latar belakang singkat")
    .max(5000, "Maksimal 5000 karakter"),
  vision: z
    .string()
    .min(1, "Isi visi hidup")
    .max(5000, "Maksimal 5000 karakter"),
  mission: z
    .string()
    .min(1, "Isi misi rumah tangga")
    .max(5000, "Maksimal 5000 karakter"),
  marriageTarget: z.string().max(5000).optional(),
  polygamyView: z.string().optional(),
  parentsInvolvement: z.enum(["", "ya", "tidak", "wali"]).optional(),
  smokingStatus: z.enum(["", "ya", "tidak", "proses_berhenti"]).optional(),
  personalityTraits: z.string().max(10000).optional(),
  interests: z.string().max(5000).optional(),
});

export const step3Schema = z.object({
  partnerCriteria: z
    .string()
    .min(1, "Isi kriteria pasangan")
    .max(10000, "Maksimal 10000 karakter"),
  partnerCity: z.string().min(1, "Masukkan domisili pasangan"),
  partnerOccupation: z.string().min(1, "Masukkan pekerjaan pasangan"),
  partnerAgeMin: z
    .number()
    .int("Harus bilangan bulat")
    .min(17, "Minimal 17 tahun")
    .max(50, "Maksimal 50 tahun")
    .nullable()
    .optional(),
  partnerAgeMax: z
    .number()
    .int("Harus bilangan bulat")
    .min(17, "Minimal 17 tahun")
    .max(50, "Maksimal 50 tahun")
    .nullable()
    .optional(),
});

export const step4Schema = z.object({
  religiousUnderstanding: z
    .string()
    .min(1, "Isi pemahaman agama")
    .max(10000, "Maksimal 10000 karakter"),
  manhaj: z
    .string()
    .min(1, "Isi manhaj")
    .max(5000, "Maksimal 5000 karakter"),
  memorization: z
    .string()
    .min(1, "Isi hafalan")
    .max(5000, "Maksimal 5000 karakter"),
  dailyWorship: z
    .string()
    .min(1, "Isi kebiasaan ibadah")
    .max(5000, "Maksimal 5000 karakter"),
});

export const step5Schema = z.object({
  qa: z.array(qaItemSchema).min(1, "Tambah minimal 1 pertanyaan"),
});
