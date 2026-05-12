"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";

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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";

const COOLDOWN_KEY = "forgot-password-cooldown";
const COOLDOWN_DURATION = 300;

function getInitialCooldown(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(COOLDOWN_KEY);
  if (!stored) return 0;
  const endTime = parseInt(stored, 10);
  const remaining = Math.ceil((endTime - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

function setCooldownStorage() {
  if (typeof window === "undefined") return;
  const endTime = Date.now() + COOLDOWN_DURATION * 1000;
  localStorage.setItem(COOLDOWN_KEY, endTime.toString());
}

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [cooldown, setCooldown] = React.useState<number>(getInitialCooldown);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
    },
  });

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        const newVal = prev - 1;
        if (newVal <= 0) {
          clearInterval(timer);
          localStorage.removeItem(COOLDOWN_KEY);
          return 0;
        }
        return newVal;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function onSubmit(data: ForgotPasswordValues) {
    if (cooldown > 0) {
      toast.error(`Tunggu ${cooldown} detik sebelum mencoba lagi.`);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message || "Gagal mengirim email reset.");
        return;
      }

      toast.success("Link reset password telah dikirim ke email Anda.");
      setCooldownStorage();
      setCooldown(COOLDOWN_DURATION);
    } catch {
      toast.error("Terjadi kesalahan teknis. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    type="email"
                    placeholder="nama@email.com"
                    disabled={isLoading || cooldown > 0}
                    {...field}
                  />
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="h-[52px] w-full text-[15px] font-semibold tracking-[0.01em] transition-all duration-200 ease-out hover:opacity-92 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0"
          disabled={isLoading || cooldown > 0}
        >
          {isLoading && <Spinner className="mr-2" />}
          {cooldown > 0
            ? `Tunggu ${formatTime(cooldown)} untuk kirim ulang`
            : "Kirim Link Reset"}
        </Button>

        {cooldown > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Link reset hanya bisa dikirim sekali dalam 5 menit
          </p>
        )}
      </form>
    </Form>
  );
}
