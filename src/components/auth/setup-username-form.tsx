"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { UsernameInput } from "@/components/auth/username-input";
import { useUsernameAvailability } from "@/hooks/use-username-availability";

const setupUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_.]+$/, "Username hanya boleh berisi huruf, angka, underscore, dan titik"),
});

type FormData = z.infer<typeof setupUsernameSchema>;

export function SetupUsernameForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(setupUsernameSchema),
    defaultValues: {
      username: "",
    },
    mode: "onChange",
  });

  const usernameValue = useWatch({ control: form.control, name: "username" }) ?? "";
  const { isCheckingUsername, isUsernameAvailable } = useUsernameAvailability(usernameValue);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const { error } = await authClient.updateUser({
        username: data.username,
      });

      if (error) {
        toast.error(error.message || "Gagal menyimpan username. Silakan coba lagi.");
        return;
      }

      toast.success("Username berhasil disimpan!");
      router.push("/onboarding");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan teknis.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <UsernameInput
          control={form.control}
          disabled={isLoading}
          isCheckingUsername={isCheckingUsername}
          isUsernameAvailable={isUsernameAvailable}
        />
        <Button
          className="h-11 w-full"
          type="submit"
          disabled={isLoading || isCheckingUsername || isUsernameAvailable === false}
        >
          {isLoading && <Spinner className="mr-2" />}
          Simpan & Lanjutkan
        </Button>
      </form>
    </Form>
  );
}
