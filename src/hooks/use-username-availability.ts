"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";

export function useUsernameAvailability(usernameValue: string) {
  const [isCheckingUsername, setIsCheckingUsername] = React.useState(false);
  const [isUsernameAvailableResult, setIsUsernameAvailableResult] = React.useState<boolean | null>(
    null
  );

  const isUsernameAvailable =
    usernameValue && usernameValue.length >= 3 ? isUsernameAvailableResult : null;

  React.useEffect(() => {
    if (!usernameValue || usernameValue.length < 3) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const { data } = await authClient.isUsernameAvailable({
          username: usernameValue,
        });
        setIsUsernameAvailableResult(data?.available ?? false);
      } catch (err: unknown) {
        console.error("Error checking username:", err);
        setIsUsernameAvailableResult(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [usernameValue]);

  return { isCheckingUsername, isUsernameAvailableResult, isUsernameAvailable };
}
