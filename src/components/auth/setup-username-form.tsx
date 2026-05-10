"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Venus, Mars, Lock } from "lucide-react";

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
  gender: z.enum(["male", "female"], { message: "Pilih jenis kelamin." }),
});

type FormData = z.infer<typeof setupUsernameSchema>;

export function SetupUsernameForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(setupUsernameSchema),
    defaultValues: {
      username: "",
      gender: undefined,
    },
    mode: "onChange",
  });

  const usernameValue = useWatch({ control: form.control, name: "username" }) ?? "";
  const { isCheckingUsername, isUsernameAvailable } = useUsernameAvailability(usernameValue);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const updatePayload: Record<string, unknown> = {
        username: data.username,
        gender: data.gender,
      };
      const { error } = await authClient.updateUser(updatePayload as never);

      if (error) {
        toast.error(error.message || "Gagal menyimpan data. Silakan coba lagi.");
        return;
      }

      toast.success("Data berhasil disimpan!");
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
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Kelamin</FormLabel>
              <FormControl>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={field.value === "male" ? "default" : "outline"}
                    className={`h-11 flex-1 gap-2 ${field.value === "male" ? "" : "border-border/60"}`}
                    onClick={() => field.onChange("male")}
                    disabled={isLoading}
                  >
                    <Mars className="h-4 w-4" />
                    Laki-laki
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "female" ? "default" : "outline"}
                    className={`h-11 flex-1 gap-2 ${field.value === "female" ? "" : "border-border/60"}`}
                    onClick={() => field.onChange("female")}
                    disabled={isLoading}
                  >
                    <Venus className="h-4 w-4" />
                    Perempuan
                  </Button>
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                <Lock className="h-3 w-3" />
                Jenis kelamin tidak dapat diubah setelah ini
              </p>
              <FormMessage />
            </FormItem>
          )}
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
