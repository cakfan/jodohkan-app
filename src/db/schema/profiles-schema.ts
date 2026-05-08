import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  date,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const profile = pgTable(
  "profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    gender: text("gender"),
    birthDate: date("birth_date"),
    birthPlace: text("birth_place"),
    ethnicity: text("ethnicity"),
    height: integer("height"),
    weight: integer("weight"),
    skinColor: text("skin_color"),
    maritalStatus: text("marital_status"),
    country: text("country"),
    city: text("city"),
    occupation: text("occupation"),
    education: text("education"),
    bio: text("bio"),
    vision: text("vision"),
    mission: text("mission"),
    partnerCriteria: text("partner_criteria"),
    religiousUnderstanding: text("religious_understanding"),
    manhaj: text("manhaj"),
    memorization: text("memorization"),
    dailyWorship: text("daily_worship"),
    qa: jsonb("qa"),
    photoUrl: text("photo_url"),
    photoBlurredUrl: text("photo_blurred_url"),
    photoBlurred: boolean("photo_blurred").default(true),
    isVerified: boolean("is_verified").default(false),
    onboardingCompleted: boolean("onboarding_completed").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("profile_userId_idx").on(table.userId)]
).enableRLS();

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}));
