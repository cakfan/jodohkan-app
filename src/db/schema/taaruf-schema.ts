import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { mediator } from "./mediators-schema";

export const taarufRequest = pgTable(
  "taaruf_request",
  {
    id: text("id").primaryKey(),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediatorId: text("mediator_id").references(() => mediator.id, {
      onDelete: "set null",
    }),
    phase: text("phase", {
      enum: ["chat", "nadzor", "khitbah", "completed"],
    })
      .default("chat")
      .notNull(),
    phaseUpdatedAt: timestamp("phase_updated_at"),
    status: text("status").default("pending").notNull(),
    message: text("message"),
    senderRead: boolean("sender_read").default(false).notNull(),
    recipientRead: boolean("recipient_read").default(false).notNull(),
    // Readiness nadzor
    readinessIkhwan: timestamp("readiness_ikhwan"),
    readinessAkhwat: timestamp("readiness_akhwat"),
    readinessTimer: timestamp("readiness_timer"),
    // Decision timer (after nadzor call — 7 days)
    decisionTimer: timestamp("decision_timer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    respondedAt: timestamp("responded_at"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("taaruf_senderId_idx").on(table.senderId),
    index("taaruf_recipientId_idx").on(table.recipientId),
    index("taaruf_mediatorId_idx").on(table.mediatorId),
    index("taaruf_status_idx").on(table.status),
    index("taaruf_phase_idx").on(table.phase),
  ]
).enableRLS();

export const taarufRequestRelations = relations(taarufRequest, ({ one }) => ({
  sender: one(user, {
    fields: [taarufRequest.senderId],
    references: [user.id],
  }),
  recipient: one(user, {
    fields: [taarufRequest.recipientId],
    references: [user.id],
  }),
  mediator: one(mediator, {
    fields: [taarufRequest.mediatorId],
    references: [mediator.id],
  }),
}));


