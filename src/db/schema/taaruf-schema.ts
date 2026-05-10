import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

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
    status: text("status").default("pending").notNull(),
    message: text("message"),
    senderRead: boolean("sender_read").default(false).notNull(),
    recipientRead: boolean("recipient_read").default(false).notNull(),
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
    index("taaruf_status_idx").on(table.status),
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
}));


