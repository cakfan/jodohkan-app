import type { profile } from "@/db/schema/profiles-schema";

type ProfileSelect = typeof profile.$inferSelect;

type NonProfileFields = "id" | "userId" | "createdAt" | "updatedAt" | "isVerified" | "onboardingCompleted";

type Editable = Omit<ProfileSelect, NonProfileFields>;

export type InferProfileData = {
  name?: string | null;
  qa?: { question: string; answer: string }[] | null;
} & {
  [K in keyof Editable]?: Editable[K] | null;
};
