import { createAuthClient } from "better-auth/react";
import { usernameClient, adminClient } from "better-auth/client/plugins";
import { ac, admin, user, mediator } from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    usernameClient(),
    adminClient({ ac, roles: { admin, user, mediator } }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
