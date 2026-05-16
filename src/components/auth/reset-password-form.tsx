"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff } from "lucide-react";

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
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (!token) {
      toast.error("Token reset tidak valid.");
      router.push("/masuk");
    }
  }, [token, router]);

  async function onSubmit(data: ResetPasswordValues) {
    if (!token) return;

    setIsLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (error) {
        toast.error(error.message || "Gagal reset password.");
        return;
      }

      toast.success("Password berhasil direset! Silakan masuk dengan password baru.");
      router.push("/masuk");
    } catch {
      toast.error("Terjadi kesalahan teknis. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center text-muted-foreground">
        Memvalidasi token...
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground text-[13px] font-[500]">
                Password Baru
              </FormLabel>
              <FormControl>
                <InputGroup className="h-12 dark:bg-popover transition-colors duration-200">
                  <InputGroupAddon>
                    <Lock className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...field}
                  />
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground text-[13px] font-[500]">
                Konfirmasi Password
              </FormLabel>
              <FormControl>
                <InputGroup className="h-12 dark:bg-popover transition-colors duration-200">
                  <InputGroupAddon>
                    <Lock className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...field}
                  />
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="h-[52px] w-full text-[15px] font-semibold tracking-[0.01em] transition-all duration-200 ease-out hover:opacity-92 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0"
          disabled={isLoading}
        >
          {isLoading && <Spinner className="mr-2" />}
          Reset Password
        </Button>
      </form>
    </Form>
  );
}
