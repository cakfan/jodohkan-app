import * as z from "zod";

export const signInSchema = z.object({
  username: z.string().min(3, {
    message: "Username minimal 3 karakter.",
  }),
  password: z.string().min(8, {
    message: "Password minimal 8 karakter.",
  }),
});

export const signUpSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter." }),
  email: z.string().email({ message: "Email tidak valid." }),
  username: z.string().min(3, { message: "Username minimal 3 karakter." }),
  password: z.string().min(8, { message: "Password minimal 8 karakter." }),
  gender: z.enum(["male", "female"], { message: "Pilih jenis kelamin." }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email tidak valid." }),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password minimal 8 karakter." }),
  confirmPassword: z.string().min(8, { message: "Konfirmasi password minimal 8 karakter." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok.",
  path: ["confirmPassword"],
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
