CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"external_id" text NOT NULL,
	"xendit_invoice_id" text,
	"xendit_checkout_url" text,
	"amount" integer NOT NULL,
	"tokens" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"expired_at" timestamp,
	CONSTRAINT "payment_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
ALTER TABLE "payment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payment_userId_idx" ON "payment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_externalId_idx" ON "payment" USING btree ("external_id");