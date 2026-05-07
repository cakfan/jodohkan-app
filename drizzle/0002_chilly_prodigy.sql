CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"gender" text,
	"birth_date" date,
	"age" integer,
	"height" integer,
	"weight" integer,
	"marital_status" text,
	"country" text,
	"city" text,
	"occupation" text,
	"education" text,
	"bio" text,
	"vision" text,
	"mission" text,
	"partner_criteria" text,
	"religious_understanding" text,
	"manhaj" text,
	"memorization" text,
	"daily_worship" text,
	"qa" jsonb,
	"photo_url" text,
	"photo_blurred" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mediator" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"certificate" text,
	"specialization" text,
	"is_verified" boolean DEFAULT false,
	"verified_by" text,
	"bio" text,
	"phone" text,
	"max_active_sessions" integer DEFAULT 10,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mediator_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "mediator" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "token_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"reference_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "token_transaction" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wallet" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "wallet" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediator" ADD CONSTRAINT "mediator_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediator" ADD CONSTRAINT "mediator_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_transaction" ADD CONSTRAINT "token_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profile_userId_idx" ON "profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mediator_userId_idx" ON "mediator" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "token_transaction_userId_idx" ON "token_transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wallet_userId_idx" ON "wallet" USING btree ("user_id");