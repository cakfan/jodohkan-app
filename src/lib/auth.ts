import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { username, admin } from "better-auth/plugins";
import { Resend } from "resend";
import { getVerificationEmailHtml } from "./email-templates";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY belum diset");
  }
  return new Resend(apiKey);
}


export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const from = process.env.RESEND_FROM;
      if (!from) {
        throw new Error("RESEND_FROM belum diset");
      }

      await getResend().emails.send({
        from,
        to: user.email,
        subject: "Verifikasi Email - Pethuk Jodoh",
        text: `Klik link ini untuk verifikasi email: ${url}`,
        html: getVerificationEmailHtml(user.name, user.email, url),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    username(),
    admin(),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: "candidate",
            },
          };
        },
      },
    },
  },
});
