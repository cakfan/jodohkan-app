ALTER TABLE "profile" ADD COLUMN "cv_status" text DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "ktp_blurred_url";