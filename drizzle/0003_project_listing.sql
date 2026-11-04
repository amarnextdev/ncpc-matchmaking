ALTER TYPE "public"."project_status" ADD VALUE IF NOT EXISTS 'changes_requested';--> statement-breakpoint
ALTER TYPE "public"."project_status" ADD VALUE IF NOT EXISTS 'rejected';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "own_funds" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "impact_co2_tonnes" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "impact_mwh" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "impact_jobs" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "impact_water_m3" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "expected_start" date;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "review_note" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "reviewed_by" uuid;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_reviewed_by_users_id_fk') THEN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"created_by" uuid,
	"title" text,
	"step" smallint DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_drafts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_drafts_org_id_organisations_id_fk') THEN
    ALTER TABLE "project_drafts" ADD CONSTRAINT "project_drafts_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_drafts_created_by_users_id_fk') THEN
    ALTER TABLE "project_drafts" ADD CONSTRAINT "project_drafts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_drafts_org_id_index" ON "project_drafts" USING btree ("org_id");
