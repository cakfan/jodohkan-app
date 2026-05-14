CREATE TABLE "adab_violation" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"user_id" text NOT NULL,
	"message_text" text,
	"violation_type" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "adab_violation_channel_idx" ON "adab_violation" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "adab_violation_user_idx" ON "adab_violation" USING btree ("user_id");