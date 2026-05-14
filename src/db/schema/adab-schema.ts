import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const adabViolation = pgTable(
  "adab_violation",
  {
    id: text("id").primaryKey(),
    channelId: text("channel_id").notNull(),
    userId: text("user_id").notNull(),
    messageText: text("message_text"),
    violationType: text("violation_type", {
      enum: ["bad_word", "inappropriate_image", "spam"],
    }).notNull(),
    reason: text("reason").notNull(),
    status: text("status", {
      enum: ["frozen", "appealed", "overturned", "upheld"],
    }).default("frozen").notNull(),
    appealReason: text("appeal_reason"),
    appealedAt: timestamp("appealed_at"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("adab_violation_channel_idx").on(table.channelId),
    index("adab_violation_user_idx").on(table.userId),
  ]
);
