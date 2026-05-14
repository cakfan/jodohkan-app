CREATE TABLE "moderator_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"nadzor_session_id" text NOT NULL,
	"moderator_id" text NOT NULL,
	"action" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "moderator_audit_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "nadzor_session" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"requested_by" text NOT NULL,
	"mediator_id" text NOT NULL,
	"max_duration_minutes" integer DEFAULT 30 NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"ended_by" text,
	"end_reason" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"feedback_ikhwan" text,
	"feedback_akhwat" text,
	"mediator_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nadzor_session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "nadzor_session_agreement" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text NOT NULL,
	"agreed" boolean DEFAULT false NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	CONSTRAINT "nadzor_agreement_session_user_unique" UNIQUE("session_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "nadzor_session_agreement" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "taaruf_request" ADD COLUMN "mediator_id" text;--> statement-breakpoint
ALTER TABLE "taaruf_request" ADD COLUMN "phase" text DEFAULT 'chat' NOT NULL;--> statement-breakpoint
ALTER TABLE "taaruf_request" ADD COLUMN "phase_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "moderator_audit_log" ADD CONSTRAINT "moderator_audit_log_nadzor_session_id_nadzor_session_id_fk" FOREIGN KEY ("nadzor_session_id") REFERENCES "public"."nadzor_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_audit_log" ADD CONSTRAINT "moderator_audit_log_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nadzor_session" ADD CONSTRAINT "nadzor_session_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nadzor_session" ADD CONSTRAINT "nadzor_session_mediator_id_user_id_fk" FOREIGN KEY ("mediator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nadzor_session" ADD CONSTRAINT "nadzor_session_ended_by_user_id_fk" FOREIGN KEY ("ended_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nadzor_session_agreement" ADD CONSTRAINT "nadzor_session_agreement_session_id_nadzor_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."nadzor_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nadzor_session_agreement" ADD CONSTRAINT "nadzor_session_agreement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "moderator_audit_session_created_idx" ON "moderator_audit_log" USING btree ("nadzor_session_id","created_at");--> statement-breakpoint
CREATE INDEX "moderator_audit_moderator_idx" ON "moderator_audit_log" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "nadzor_session_channel_status_idx" ON "nadzor_session" USING btree ("channel_id","status");--> statement-breakpoint
CREATE INDEX "nadzor_session_mediator_status_idx" ON "nadzor_session" USING btree ("mediator_id","status");--> statement-breakpoint
CREATE INDEX "nadzor_session_scheduledAt_idx" ON "nadzor_session" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "nadzor_session_status_scheduledAt_idx" ON "nadzor_session" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "nadzor_agreement_session_idx" ON "nadzor_session_agreement" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "nadzor_agreement_user_idx" ON "nadzor_session_agreement" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "taaruf_request" ADD CONSTRAINT "taaruf_request_mediator_id_mediator_id_fk" FOREIGN KEY ("mediator_id") REFERENCES "public"."mediator"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "taaruf_mediatorId_idx" ON "taaruf_request" USING btree ("mediator_id");--> statement-breakpoint
CREATE INDEX "taaruf_phase_idx" ON "taaruf_request" USING btree ("phase");