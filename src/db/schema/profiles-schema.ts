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
    partnerCity: text("partner_city"),
    partnerOccupation: text("partner_occupation"),
    partnerAgeMin: integer("partner_age_min"),
    partnerAgeMax: integer("partner_age_max"),
    religiousUnderstanding: text("religious_understanding"),
    manhaj: text("manhaj"),
    memorization: text("memorization"),
    dailyWorship: text("daily_worship"),
    qa: jsonb("qa"),
    photoUrl: text("photo_url"),
    photoBlurredUrl: text("photo_blurred_url"),
    photoBlurred: boolean("photo_blurred").default(true),
    childCount: integer("child_count"),
    hairColor: text("hair_color"),
    hairType: text("hair_type"),
    hijabStatus: text("hijab_status"),
    faceAppearance: text("face_appearance"),
    otherPhysicalTraits: text("other_physical_traits"),
    marriageTarget: text("marriage_target"),
    polygamyView: text("polygamy_view"),
    parentsInvolvement: text("parents_involvement"),
    smokingStatus: text("smoking_status"),
    personalityTraits: text("personality_traits"),
    interests: text("interests"),
    ktpUrl: text("ktp_url"),
    cvStatus: text("cv_status").default("draft"),
    published: boolean("published").default(false).notNull(),
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
