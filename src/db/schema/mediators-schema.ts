import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const mediator = pgTable(
  "mediator",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    certificate: text("certificate"),
    specialization: text("specialization"),
    isVerified: boolean("is_verified").default(false),
    verifiedBy: text("verified_by").references(() => user.id),
    bio: text("bio"),
    phone: text("phone"),
    maxActiveSessions: integer("max_active_sessions").default(10),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("mediator_userId_idx").on(table.userId)]
).enableRLS();

export const mediatorRelations = relations(mediator, ({ one }) => ({
  user: one(user, {
    fields: [mediator.userId],
    references: [user.id],
  }),
  verifiedByUser: one(user, {
    fields: [mediator.verifiedBy],
    references: [user.id],
  }),
}));
