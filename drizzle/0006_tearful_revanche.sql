ALTER TABLE "adab_violation" ADD COLUMN "status" text DEFAULT 'frozen' NOT NULL;--> statement-breakpoint
ALTER TABLE "adab_violation" ADD COLUMN "appeal_reason" text;--> statement-breakpoint
ALTER TABLE "adab_violation" ADD COLUMN "appealed_at" timestamp;--> statement-breakpoint
ALTER TABLE "adab_violation" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "adab_violation" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "adab_violation" ADD COLUMN "review_notes" text;