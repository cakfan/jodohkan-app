import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  index,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const nadzorSession = pgTable(
  "nadzor_session",
  {
    id: text("id").primaryKey(),
    channelId: text("channel_id").notNull(),
    requestedBy: text("requested_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediatorId: text("mediator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    maxDurationMinutes: integer("max_duration_minutes")
      .default(30)
      .notNull(),
    scheduledAt: timestamp("scheduled_at").notNull(),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    endedBy: text("ended_by").references(() => user.id, {
      onDelete: "set null",
    }),
    endReason: text("end_reason", {
      enum: ["completed", "timeout", "violation", "cancelled"],
    }),
    status: text("status", {
      enum: ["scheduled", "ongoing", "completed", "cancelled", "terminated"],
    })
      .default("scheduled")
      .notNull(),
    feedbackIkhwan: text("feedback_ikhwan"),
    feedbackAkhwat: text("feedback_akhwat"),
    mediatorNotes: text("mediator_notes"),
    decisionIkhwan: text("decision_ikhwan", {
      enum: ["continue", "stop"],
    }),
    decisionAkhwat: text("decision_akhwat", {
      enum: ["continue", "stop"],
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("nadzor_session_channel_status_idx").on(
      table.channelId,
      table.status
    ),
    index("nadzor_session_mediator_status_idx").on(
      table.mediatorId,
      table.status
    ),
    index("nadzor_session_scheduledAt_idx").on(table.scheduledAt),
    index("nadzor_session_status_scheduledAt_idx").on(
      table.status,
      table.scheduledAt
    ),
  ]
).enableRLS();

export const nadzorSessionAgreement = pgTable(
  "nadzor_session_agreement",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => nadzorSession.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    agreed: boolean("agreed").default(false).notNull(),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    respondedAt: timestamp("responded_at"),
  },
  (table) => [
    unique("nadzor_agreement_session_user_unique").on(
      table.sessionId,
      table.userId
    ),
    index("nadzor_agreement_session_idx").on(table.sessionId),
    index("nadzor_agreement_user_idx").on(table.userId),
  ]
).enableRLS();

export const moderatorAuditLog = pgTable(
  "moderator_audit_log",
  {
    id: text("id").primaryKey(),
    nadzorSessionId: text("nadzor_session_id")
      .notNull()
      .references(() => nadzorSession.id, { onDelete: "cascade" }),
    moderatorId: text("moderator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("moderator_audit_session_created_idx").on(
      table.nadzorSessionId,
      table.createdAt
    ),
    index("moderator_audit_moderator_idx").on(table.moderatorId),
  ]
).enableRLS();

export const nadzorSessionRelations = relations(
  nadzorSession,
  ({ one, many }) => ({
    requestedByUser: one(user, {
      fields: [nadzorSession.requestedBy],
      references: [user.id],
    }),
    mediator: one(user, {
      fields: [nadzorSession.mediatorId],
      references: [user.id],
    }),
    endedByUser: one(user, {
      fields: [nadzorSession.endedBy],
      references: [user.id],
    }),
    agreements: many(nadzorSessionAgreement),
    auditLogs: many(moderatorAuditLog),
  })
);

export const nadzorSessionAgreementRelations = relations(
  nadzorSessionAgreement,
  ({ one }) => ({
    session: one(nadzorSession, {
      fields: [nadzorSessionAgreement.sessionId],
      references: [nadzorSession.id],
    }),
    user: one(user, {
      fields: [nadzorSessionAgreement.userId],
      references: [user.id],
    }),
  })
);

export const moderatorAuditLogRelations = relations(
  moderatorAuditLog,
  ({ one }) => ({
    session: one(nadzorSession, {
      fields: [moderatorAuditLog.nadzorSessionId],
      references: [nadzorSession.id],
    }),
    moderator: one(user, {
      fields: [moderatorAuditLog.moderatorId],
      references: [user.id],
    }),
  })
);
