"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Mail, Lock, CheckCircle2, Venus, Mars } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";
import { UsernameInput } from "@/components/auth/username-input";
import { useUsernameAvailability } from "@/hooks/use-username-availability";

type FormData = SignUpValues;

export function UserSignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [isSocialLoading, setIsSocialLoading] = React.useState<boolean>(false);
  const form = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      gender: undefined,
    },
    mode: "onChange",
  });

  const usernameValue =
    useWatch({
      control: form.control,
      name: "username",
    }) ?? "";

  const { isCheckingUsername, isUsernameAvailable } = useUsernameAvailability(usernameValue);

  const handleSocialLogin = async (provider: "google") => {
    setIsSocialLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/setup-username",
      });
    } catch {
      toast.error(`Gagal mendaftar dengan ${provider}.`);
      setIsSocialLoading(false);
    }
  };

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const signUpPayload: Record<string, unknown> = {
        email: data.email,
        password: data.password,
        name: data.name,
        username: data.username,
        gender: data.gender,
      };
      const { error } = await authClient.signUp.email(signUpPayload as never);

      if (error) {
        toast.error(error.message || "Gagal mendaftar. Silakan coba lagi.");
        return;
      }

      setIsSuccess(true);
      toast.success("Pendaftaran berhasil! Silakan cek email Anda.");
      setTimeout(() => {
        router.push("/signin");
        router.refresh();
      }, 3000);
    } catch {
      toast.error("Terjadi kesalahan teknis.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 py-8 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="text-primary h-12 w-12 animate-bounce" />
        </div>
        <h3 className="text-xl font-semibold">Pendaftaran Berhasil!</h3>
        <p className="text-muted-foreground">
          Kami telah mengirimkan tautan verifikasi ke email Anda. Silakan verifikasi akun Anda
          sebelum masuk.
        </p>
        <p className="text-muted-foreground animate-pulse text-sm">
          Mengalihkan Anda ke halaman masuk...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-[13px] font-[500]">
                  Nama Lengkap
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama sesuai KTP"
                    className="h-12 px-4"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-[13px] font-[500]">
                  Jenis Kelamin
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition-all duration-200 ${
                        field.value === "male"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => field.onChange("male")}
                      disabled={isLoading}
                    >
                      <Mars className="h-4 w-4" />
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition-all duration-200 ${
                        field.value === "female"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => field.onChange("female")}
                      disabled={isLoading}
                    >
                      <Venus className="h-4 w-4" />
                      Perempuan
                    </button>
                  </div>
                </FormControl>
                <p className="text-muted-foreground mt-1.5 flex items-center gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  Jenis kelamin tidak dapat diubah setelah pendaftaran
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-[13px] font-[500]">
                  Email
                </FormLabel>
                <FormControl>
                  <InputGroup className="h-12 dark:bg-popover transition-colors duration-200">
                    <InputGroupAddon>
                      <Mail className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="anda@contoh.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <UsernameInput
            control={form.control}
            disabled={isLoading}
            isCheckingUsername={isCheckingUsername}
            isUsernameAvailable={isUsernameAvailable}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-[13px] font-[500]">
                  Password
                </FormLabel>
                <FormControl>
                  <InputGroup className="h-12 dark:bg-popover transition-colors duration-200">
                    <InputGroupAddon>
                      <Lock className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="password"
                      placeholder="Minimal 8 karakter"
                      disabled={isLoading}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="h-[52px] w-full text-[15px] font-semibold tracking-[0.01em] transition-all duration-200 ease-out hover:opacity-92 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0"
            type="submit"
            disabled={isLoading || isCheckingUsername || isUsernameAvailable === false}
          >
            {isLoading && <Spinner className="mr-2" />}
            Daftar Sekarang
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.08em]">
          <span className="bg-card text-muted-foreground px-2 text-[11px]">
            Atau daftar dengan
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        className="h-12 border-border bg-muted hover:bg-secondary transition-all duration-200"
        disabled={isLoading || isSocialLoading}
        onClick={() => handleSocialLogin("google")}
      >
        {isSocialLoading ? (
          <Spinner className="mr-2" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
        )}
        Google
      </Button>
    </div>
  );
}
