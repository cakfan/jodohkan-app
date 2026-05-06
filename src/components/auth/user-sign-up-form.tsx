"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Loader2, User, Mail, Lock, CheckCircle2, Check, XCircle } from "lucide-react";

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";

type FormData = SignUpValues;

export function UserSignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [isCheckingUsername, setIsCheckingUsername] = React.useState<boolean>(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = React.useState<boolean | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  const usernameValue = useWatch({
    control: form.control,
    name: "username",
  });

  React.useEffect(() => {
    if (!usernameValue || usernameValue.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const { data } = await authClient.isUsernameAvailable({
          username: usernameValue,
        });
        setIsUsernameAvailable(data?.available ?? false);
      } catch (err) {
        console.error("Error checking username:", err);
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [usernameValue]);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        username: data.username,
      });

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
    } catch (err) {
      toast.error("Terjadi kesalahan teknis.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-primary animate-bounce" />
        </div>
        <h3 className="text-xl font-semibold">Pendaftaran Berhasil!</h3>
        <p className="text-muted-foreground">
          Kami telah mengirimkan tautan verifikasi ke email Anda.
          Silakan verifikasi akun Anda sebelum masuk.
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">
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
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Nama sesuai KTP" className="h-11" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <InputGroup className="h-11">
                    <InputGroupAddon>
                      <Mail />
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
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <InputGroup className="h-11">
                    <InputGroupAddon>
                      <User />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="username_pilihan"
                      disabled={isLoading}
                      {...field}
                    />
                    <InputGroupAddon align="inline-end">
                      {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin" />}
                      {!isCheckingUsername && isUsernameAvailable === true && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {!isCheckingUsername && isUsernameAvailable === false && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
                {!isCheckingUsername && isUsernameAvailable === false && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    Username sudah digunakan.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <InputGroup className="h-11">
                    <InputGroupAddon>
                      <Lock />
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
            className="w-full h-11"
            type="submit"
            disabled={isLoading || isCheckingUsername || isUsernameAvailable === false}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Daftar Sekarang
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Atau daftar dengan</span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        className="h-11"
        disabled={isLoading}
        onClick={() => authClient.signIn.social({ provider: "google" })}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        Google
      </Button>
    </div>
  );
}
