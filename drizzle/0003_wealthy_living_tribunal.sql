CREATE TABLE "taaruf_request" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"sender_read" boolean DEFAULT false NOT NULL,
	"recipient_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"responded_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "taaruf_request" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "taaruf_request" ADD CONSTRAINT "taaruf_request_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taaruf_request" ADD CONSTRAINT "taaruf_request_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "taaruf_senderId_idx" ON "taaruf_request" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "taaruf_recipientId_idx" ON "taaruf_request" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "taaruf_status_idx" ON "taaruf_request" USING btree ("status");