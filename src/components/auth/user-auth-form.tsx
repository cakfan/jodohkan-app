"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, User, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";
import { signInSchema, type SignInValues } from "@/lib/validations/auth";

type FormData = SignInValues;

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSocialLoading, setIsSocialLoading] = React.useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.username({
        username: data.username,
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Gagal masuk. Periksa kembali data Anda.");
        return;
      }

      toast.success("Berhasil masuk!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan teknis. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSocialLogin = async (provider: "google") => {
    setIsSocialLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/setup-username",
      });
    } catch {
      toast.error(`Gagal masuk dengan ${provider}.`);
      setIsSocialLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      placeholder="username_anda"
                      disabled={isLoading || isSocialLoading}
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href={"/forgot-password"}
                    className={cn(
                      buttonVariants({ variant: "link" }),
                      "text-muted-foreground h-auto p-0 text-xs font-normal"
                    )}
                  >
                    Lupa password?
                  </Link>
                </div>
                <FormControl>
                  <InputGroup className="h-11">
                    <InputGroupAddon>
                      <Lock />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading || isSocialLoading}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="h-11 w-full" type="submit" disabled={isLoading || isSocialLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Masuk
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card text-muted-foreground px-2">Atau lanjut dengan</span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        className="h-11"
        disabled={isLoading || isSocialLoading}
        onClick={() => handleSocialLogin("google")}
      >
        {isSocialLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
