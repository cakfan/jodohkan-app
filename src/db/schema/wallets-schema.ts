import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const wallet = pgTable(
  "wallet",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    balance: integer("balance").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("wallet_userId_idx").on(table.userId)]
).enableRLS();

export const tokenTransaction = pgTable(
  "token_transaction",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    amount: integer("amount").notNull(),
    description: text("description"),
    referenceId: text("reference_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("token_transaction_userId_idx").on(table.userId)]
).enableRLS();

export const payment = pgTable(
  "payment",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull().unique(),
    xenditInvoiceId: text("xendit_invoice_id"),
    xenditCheckoutUrl: text("xendit_checkout_url"),
    amount: integer("amount").notNull(),
    tokens: integer("tokens").notNull(),
    status: text("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    paidAt: timestamp("paid_at"),
    expiredAt: timestamp("expired_at"),
  },
  (table) => [index("payment_userId_idx").on(table.userId), index("payment_externalId_idx").on(table.externalId)]
).enableRLS();

export const walletRelations = relations(wallet, ({ one, many }) => ({
  user: one(user, {
    fields: [wallet.userId],
    references: [user.id],
  }),
  transactions: many(tokenTransaction),
}));

export const tokenTransactionRelations = relations(tokenTransaction, ({ one }) => ({
  user: one(user, {
    fields: [tokenTransaction.userId],
    references: [user.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, {
    fields: [payment.userId],
    references: [user.id],
  }),
}));
