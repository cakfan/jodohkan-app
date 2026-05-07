"use client";

import { Loader2, User, Check, XCircle } from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";

import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

interface UsernameInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  isCheckingUsername: boolean;
  isUsernameAvailable: boolean | null;
}

export function UsernameInput<TFieldValues extends FieldValues>({
  control,
  name = "username" as Path<TFieldValues>,
  disabled = false,
  placeholder = "username_pilihan",
  label = "Username",
  isCheckingUsername,
  isUsernameAvailable,
}: UsernameInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <InputGroup className="h-11">
              <InputGroupAddon>
                <User />
              </InputGroupAddon>
              <InputGroupInput placeholder={placeholder} disabled={disabled} {...field} />
              <InputGroupAddon align="inline-end">
                {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin" />}
                {!isCheckingUsername && isUsernameAvailable === true && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {!isCheckingUsername && isUsernameAvailable === false && (
                  <XCircle className="text-destructive h-4 w-4" />
                )}
              </InputGroupAddon>
            </InputGroup>
          </FormControl>
          {!isCheckingUsername && isUsernameAvailable === false && (
            <p className="text-destructive text-[0.8rem] font-medium">Username sudah digunakan.</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
