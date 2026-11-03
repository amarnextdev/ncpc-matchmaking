CREATE TABLE IF NOT EXISTS "onboarding_drafts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"step" smallint DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onboarding_drafts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "onboarding_drafts" ADD CONSTRAINT "onboarding_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
