import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import { user } from "@/db/schema";
import * as schema from "@/db/schema";
import { username, admin } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { getVerificationEmailHtml, getPasswordResetEmailHtml } from "./email-templates";
import { ac, admin as adminRole, user as userRole, mediator } from "./permissions";

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
    sendResetPassword: async ({ user, url }) => {
      const from = process.env.RESEND_FROM;
      if (!from) {
        throw new Error("RESEND_FROM belum diset");
      }

      await getResend().emails.send({
        from,
        to: user.email,
        subject: "Reset Password - Jodohkan",
        text: `Klik link ini untuk reset password: ${url}`,
        html: getPasswordResetEmailHtml(user.name, user.email, url),
      });
    },
    resetPasswordTokenExpiresIn: 3600,
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
        subject: "Verifikasi Email - Jodohkan",
        text: `Klik link ini untuk verifikasi email: ${url}`,
        html: getVerificationEmailHtml(user.name, user.email, url),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      gender: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },
  plugins: [username(), admin({ ac, roles: { admin: adminRole, user: userRole, mediator } })],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: user.role ?? "candidate",
            },
          };
        },
      },
      update: {
        before: async (data, ctx) => {
          if (data.gender !== undefined && ctx?.context?.session?.user?.id) {
            const currentUser = await db
              .select({ gender: user.gender })
              .from(user)
              .where(eq(user.id, ctx.context.session.user.id))
              .then((rows) => rows[0]);
            if (currentUser?.gender) {
              throw new APIError("BAD_REQUEST", {
                message: "Jenis kelamin tidak dapat diubah setelah pendaftaran.",
              });
            }
          }
          return { data };
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/forget-password": {
        window: 300,
        max: 3,
      },
    },
    storage: "database",
  },
});
