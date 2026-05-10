ALTER TABLE "profile" ADD COLUMN "smoking_status" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "published" boolean DEFAULT false NOT NULL;