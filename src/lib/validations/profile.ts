import * as z from "zod";

const qaItemSchema = z.object({
  question: z.string().min(1, "Pertanyaan tidak boleh kosong"),
  answer: z.string().min(1, "Jawaban tidak boleh kosong"),
});

export const step1Schema = z.object({
  gender: z.string().min(1, "Pilih jenis kelamin"),
  birthDate: z.string().min(1, "Masukkan tanggal lahir"),
  height: z.number().positive("Tinggi badan tidak valid").nullable().optional(),
  weight: z.number().positive("Berat badan tidak valid").nullable().optional(),
  skinColor: z.string().optional(),
  maritalStatus: z.string().min(1, "Pilih status pernikahan"),
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
});

export const step3Schema = z.object({
  partnerCriteria: z
    .string()
    .min(1, "Isi kriteria pasangan")
    .max(10000, "Maksimal 10000 karakter"),
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
