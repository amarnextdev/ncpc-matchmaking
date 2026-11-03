CREATE TYPE "public"."application_status" AS ENUM('submitted', 'shortlisted', 'declined', 'funded', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."collab_request_status" AS ENUM('requested', 'submitted', 'changes_requested', 'accepted', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('in_discussion', 'due_diligence', 'agreement', 'active_partner', 'closed');--> statement-breakpoint
CREATE TYPE "public"."doc_visibility" AS ENUM('public', 'members_after_enquiry');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('pending', 'accepted', 'declined', 'expired', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."funding_type" AS ENUM('grant', 'loan', 'equity', 'blended', 'guarantee');--> statement-breakpoint
CREATE TYPE "public"."intro_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."need_status" AS ENUM('open', 'found');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('draft', 'in_review', 'live', 'closed');--> statement-breakpoint
CREATE TYPE "public"."org_category" AS ENUM('investor', 'funder', 'project_developer', 'industrial_park', 'sez', 'tenant', 'property_developer', 'esco', 'technology_provider');--> statement-breakpoint
CREATE TYPE "public"."org_status" AS ENUM('draft', 'pending', 'changes_requested', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."partner_role" AS ENUM('investor', 'funder', 'technology', 'off_taker', 'site_host', 'contractor');--> statement-breakpoint
CREATE TYPE "public"."partnership_status" AS ENUM('awaiting_confirmation', 'active', 'ended');--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('member', 'ncpc_admin');--> statement-breakpoint
CREATE TYPE "public"."project_stage" AS ENUM('idea', 'feasibility', 'funding', 'construction', 'operational');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'in_review', 'live', 'closed', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."province" AS ENUM('eastern-cape', 'free-state', 'gauteng', 'kwazulu-natal', 'limpopo', 'mpumalanga', 'north-west', 'northern-cape', 'western-cape');--> statement-breakpoint
CREATE TYPE "public"."saved_item_type" AS ENUM('project', 'organisation', 'funding_offer');--> statement-breakpoint
CREATE TYPE "public"."storage_bucket" AS ENUM('public-images', 'private-documents');--> statement-breakpoint
CREATE TYPE "public"."theme" AS ENUM('energy', 'energy_efficiency', 'water', 'waste_circularity', 'green_hydrogen');--> statement-breakpoint
CREATE TYPE "public"."upload_kind" AS ENUM('org-logo', 'org-banner', 'project-photo', 'verification-doc', 'project-doc', 'message-attachment');--> statement-breakpoint
CREATE TYPE "public"."verification_doc" AS ENUM('cipc', 'bbbee', 'tax');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"job_title" text,
	"phone" text,
	"platform_role" "platform_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_org_id" uuid,
	"uploaded_by" uuid,
	"kind" "upload_kind" NOT NULL,
	"bucket" "storage_bucket" NOT NULL,
	"path" text NOT NULL,
	"mime_type" text NOT NULL,
	"bytes" bigint NOT NULL,
	"original_name" text NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organisation_blocks" (
	"blocker_org_id" uuid NOT NULL,
	"blocked_org_id" uuid NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organisation_blocks_blocker_org_id_blocked_org_id_pk" PRIMARY KEY("blocker_org_id","blocked_org_id")
);
--> statement-breakpoint
ALTER TABLE "organisation_blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organisation_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"kind" "verification_doc" NOT NULL,
	"file_id" uuid NOT NULL,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organisation_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organisation_members" (
	"org_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organisation_members_org_id_user_id_pk" PRIMARY KEY("org_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "organisation_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" "org_category" NOT NULL,
	"status" "org_status" DEFAULT 'draft' NOT NULL,
	"registration_no" text,
	"province" "province",
	"city" text,
	"website" text,
	"bbbee_level" text,
	"about" text,
	"summary" text,
	"logo_file_id" uuid,
	"banner_file_id" uuid,
	"themes" "theme"[] DEFAULT '{}' NOT NULL,
	"offers" text[] DEFAULT '{}' NOT NULL,
	"looking_for" "partner_role"[] DEFAULT '{}' NOT NULL,
	"instruments" "funding_type"[] DEFAULT '{}' NOT NULL,
	"stages" "project_stage"[] DEFAULT '{}' NOT NULL,
	"invest_min" bigint,
	"invest_max" bigint,
	"review_note" text,
	"reviewed_by" uuid,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organisations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organisations_invest_range" CHECK ("organisations"."invest_min" is null or "organisations"."invest_max" is null or "organisations"."invest_min" <= "organisations"."invest_max")
);
--> statement-breakpoint
ALTER TABLE "organisations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"name" text NOT NULL,
	"visibility" "doc_visibility" DEFAULT 'members_after_enquiry' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"caption" text,
	"is_cover" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"update_id" uuid
);
--> statement-breakpoint
ALTER TABLE "project_media" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_needs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"role" "partner_role" NOT NULL,
	"headline" text,
	"notes" text,
	"amount" bigint,
	"status" "need_status" DEFAULT 'open' NOT NULL,
	"found_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "project_needs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"stage" "project_stage" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_updates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"org_id" uuid NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"theme" "theme" NOT NULL,
	"technologies" text[] DEFAULT '{}' NOT NULL,
	"province" "province" NOT NULL,
	"city" text,
	"site" text,
	"stage" "project_stage" DEFAULT 'idea' NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"capital_needed" bigint,
	"capital_raised" bigint DEFAULT 0 NOT NULL,
	"listed_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_capital_positive" CHECK ("projects"."capital_raised" >= 0)
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collaboration_request_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"form" jsonb NOT NULL,
	"submitted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collaboration_request_versions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collaboration_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"role" "partner_role" NOT NULL,
	"status" "collab_request_status" DEFAULT 'requested' NOT NULL,
	"form" jsonb,
	"owner_note" text,
	"version" integer DEFAULT 0 NOT NULL,
	"sent_by" uuid,
	"submitted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "collaboration_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversation_reads" (
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"last_read_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_reads_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "conversation_reads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_a_id" uuid NOT NULL,
	"org_b_id" uuid NOT NULL,
	"opened_by_enquiry_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone,
	CONSTRAINT "conversations_ordered_pair" CHECK ("conversations"."org_a_id" < "conversations"."org_b_id")
);
--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "deal_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deal_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"owner_org_id" uuid NOT NULL,
	"partner_org_id" uuid NOT NULL,
	"role" "partner_role" NOT NULL,
	"stage" "deal_stage" DEFAULT 'in_discussion' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deals_two_orgs" CHECK ("deals"."owner_org_id" <> "deals"."partner_org_id")
);
--> statement-breakpoint
ALTER TABLE "deals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_org_id" uuid NOT NULL,
	"to_org_id" uuid NOT NULL,
	"project_id" uuid,
	"role" "partner_role" NOT NULL,
	"note" varchar(300),
	"match_score" integer,
	"status" "enquiry_status" DEFAULT 'pending' NOT NULL,
	"closed_reason" text,
	"created_by" uuid,
	"responded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone,
	"expires_at" timestamp with time zone DEFAULT now() + interval '30 days' NOT NULL,
	CONSTRAINT "enquiries_not_self" CHECK ("enquiries"."from_org_id" <> "enquiries"."to_org_id")
);
--> statement-breakpoint
ALTER TABLE "enquiries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "introductions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_a_id" uuid NOT NULL,
	"org_b_id" uuid NOT NULL,
	"project_id" uuid,
	"reason" text NOT NULL,
	"status_a" "intro_status" DEFAULT 'pending' NOT NULL,
	"status_b" "intro_status" DEFAULT 'pending' NOT NULL,
	"conversation_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "introductions_two_orgs" CHECK ("introductions"."org_a_id" <> "introductions"."org_b_id")
);
--> statement-breakpoint
ALTER TABLE "introductions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_user_id" uuid,
	"sender_org_id" uuid NOT NULL,
	"body" text NOT NULL,
	"attachment_file_id" uuid,
	"deal_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"removed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "partnerships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"request_id" uuid,
	"project_id" uuid NOT NULL,
	"owner_org_id" uuid NOT NULL,
	"partner_org_id" uuid NOT NULL,
	"role" "partner_role" NOT NULL,
	"amount" bigint,
	"amount_public" boolean DEFAULT true NOT NULL,
	"status" "partnership_status" DEFAULT 'awaiting_confirmation' NOT NULL,
	"owner_confirmed_at" timestamp with time zone,
	"owner_confirmed_by" uuid,
	"partner_confirmed_at" timestamp with time zone,
	"partner_confirmed_by" uuid,
	"activated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partnerships_dealId_unique" UNIQUE("deal_id"),
	CONSTRAINT "partnerships_active_needs_both" CHECK ("partnerships"."status" <> 'active' or ("partnerships"."owner_confirmed_at" is not null and "partnerships"."partner_confirmed_at" is not null))
);
--> statement-breakpoint
ALTER TABLE "partnerships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "funding_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"applicant_org_id" uuid NOT NULL,
	"note" varchar(1000),
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "funding_applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "funding_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"provider_org_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "funding_type" NOT NULL,
	"summary" text NOT NULL,
	"about" text,
	"amount_min" bigint,
	"amount_max" bigint,
	"themes" "theme"[] DEFAULT '{}' NOT NULL,
	"stages" "project_stage"[] DEFAULT '{}' NOT NULL,
	"eligible_categories" "org_category"[] DEFAULT '{}' NOT NULL,
	"provinces" "province"[] DEFAULT '{}' NOT NULL,
	"criteria" text[] DEFAULT '{}' NOT NULL,
	"deadline" date,
	"rolling" boolean DEFAULT false NOT NULL,
	"status" "offer_status" DEFAULT 'draft' NOT NULL,
	"approved_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "funding_offers_slug_unique" UNIQUE("slug"),
	CONSTRAINT "funding_offers_amount_range" CHECK ("funding_offers"."amount_min" is null or "funding_offers"."amount_max" is null or "funding_offers"."amount_min" <= "funding_offers"."amount_max")
);
--> statement-breakpoint
ALTER TABLE "funding_offers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email_enquiries" boolean DEFAULT true NOT NULL,
	"email_messages" boolean DEFAULT true NOT NULL,
	"email_deals" boolean DEFAULT true NOT NULL,
	"email_digest" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "saved_items" (
	"user_id" uuid NOT NULL,
	"item_type" "saved_item_type" NOT NULL,
	"item_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_items_user_id_item_type_item_id_pk" PRIMARY KEY("user_id","item_type","item_id")
);
--> statement-breakpoint
ALTER TABLE "saved_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_blocks" ADD CONSTRAINT "organisation_blocks_blocker_org_id_organisations_id_fk" FOREIGN KEY ("blocker_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_blocks" ADD CONSTRAINT "organisation_blocks_blocked_org_id_organisations_id_fk" FOREIGN KEY ("blocked_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_blocks" ADD CONSTRAINT "organisation_blocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_documents" ADD CONSTRAINT "organisation_documents_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_documents" ADD CONSTRAINT "organisation_documents_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_documents" ADD CONSTRAINT "organisation_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_logo_file_id_files_id_fk" FOREIGN KEY ("logo_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_banner_file_id_files_id_fk" FOREIGN KEY ("banner_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_update_id_project_updates_id_fk" FOREIGN KEY ("update_id") REFERENCES "public"."project_updates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_needs" ADD CONSTRAINT "project_needs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_request_versions" ADD CONSTRAINT "collaboration_request_versions_request_id_collaboration_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."collaboration_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_request_versions" ADD CONSTRAINT "collaboration_request_versions_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_sent_by_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_org_a_id_organisations_id_fk" FOREIGN KEY ("org_a_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_org_b_id_organisations_id_fk" FOREIGN KEY ("org_b_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_opened_by_enquiry_id_enquiries_id_fk" FOREIGN KEY ("opened_by_enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_notes" ADD CONSTRAINT "deal_notes_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_notes" ADD CONSTRAINT "deal_notes_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_notes" ADD CONSTRAINT "deal_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_org_id_organisations_id_fk" FOREIGN KEY ("owner_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_partner_org_id_organisations_id_fk" FOREIGN KEY ("partner_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_from_org_id_organisations_id_fk" FOREIGN KEY ("from_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_to_org_id_organisations_id_fk" FOREIGN KEY ("to_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_org_a_id_organisations_id_fk" FOREIGN KEY ("org_a_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_org_b_id_organisations_id_fk" FOREIGN KEY ("org_b_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_org_id_organisations_id_fk" FOREIGN KEY ("sender_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_attachment_file_id_files_id_fk" FOREIGN KEY ("attachment_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_request_id_collaboration_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."collaboration_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_owner_org_id_organisations_id_fk" FOREIGN KEY ("owner_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_partner_org_id_organisations_id_fk" FOREIGN KEY ("partner_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_owner_confirmed_by_users_id_fk" FOREIGN KEY ("owner_confirmed_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_partner_confirmed_by_users_id_fk" FOREIGN KEY ("partner_confirmed_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_applications" ADD CONSTRAINT "funding_applications_offer_id_funding_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."funding_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_applications" ADD CONSTRAINT "funding_applications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_applications" ADD CONSTRAINT "funding_applications_applicant_org_id_organisations_id_fk" FOREIGN KEY ("applicant_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_applications" ADD CONSTRAINT "funding_applications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_offers" ADD CONSTRAINT "funding_offers_provider_org_id_organisations_id_fk" FOREIGN KEY ("provider_org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_offers" ADD CONSTRAINT "funding_offers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "files_bucket_path_index" ON "files" USING btree ("bucket","path");--> statement-breakpoint
CREATE INDEX "files_owner_org_id_index" ON "files" USING btree ("owner_org_id");--> statement-breakpoint
CREATE INDEX "files_uploaded_by_index" ON "files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE UNIQUE INDEX "organisation_documents_org_id_kind_index" ON "organisation_documents" USING btree ("org_id","kind");--> statement-breakpoint
CREATE INDEX "organisation_members_user_id_index" ON "organisation_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organisations_status_index" ON "organisations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "organisations_category_index" ON "organisations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "organisations_themes_gin" ON "organisations" USING gin ("themes");--> statement-breakpoint
CREATE INDEX "project_documents_project_id_index" ON "project_documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_media_project_id_index" ON "project_media" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_media_one_cover" ON "project_media" USING btree ("project_id") WHERE "project_media"."is_cover";--> statement-breakpoint
CREATE UNIQUE INDEX "project_needs_project_id_role_index" ON "project_needs" USING btree ("project_id","role");--> statement-breakpoint
CREATE INDEX "project_updates_project_id_index" ON "project_updates" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_org_id_index" ON "projects" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "projects_status_index" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "collaboration_request_versions_request_id_version_index" ON "collaboration_request_versions" USING btree ("request_id","version");--> statement-breakpoint
CREATE INDEX "collaboration_requests_deal_id_index" ON "collaboration_requests" USING btree ("deal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "collab_requests_one_open" ON "collaboration_requests" USING btree ("deal_id") WHERE "collaboration_requests"."status" in ('requested', 'submitted', 'changes_requested');--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_pair" ON "conversations" USING btree ("org_a_id","org_b_id");--> statement-breakpoint
CREATE INDEX "deal_notes_deal_id_org_id_index" ON "deal_notes" USING btree ("deal_id","org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "deals_one_per_project" ON "deals" USING btree ("conversation_id","project_id");--> statement-breakpoint
CREATE INDEX "deals_project_id_index" ON "deals" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "enquiries_to_org_id_status_index" ON "enquiries" USING btree ("to_org_id","status");--> statement-breakpoint
CREATE INDEX "enquiries_from_org_id_status_index" ON "enquiries" USING btree ("from_org_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "enquiries_one_pending" ON "enquiries" USING btree ("from_org_id","project_id","role") WHERE "enquiries"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "messages_conversation_id_created_at_index" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "partnerships_project_id_index" ON "partnerships" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "partnerships_partner_org_id_index" ON "partnerships" USING btree ("partner_org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "funding_applications_one_open" ON "funding_applications" USING btree ("offer_id","project_id") WHERE "funding_applications"."status" in ('submitted', 'shortlisted');--> statement-breakpoint
CREATE INDEX "funding_applications_applicant_org_id_index" ON "funding_applications" USING btree ("applicant_org_id");--> statement-breakpoint
CREATE INDEX "funding_offers_status_index" ON "funding_offers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "funding_offers_provider_org_id_index" ON "funding_offers" USING btree ("provider_org_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_entity_id_index" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_created_at_index" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE POLICY "profiles_read_own" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = id);--> statement-breakpoint
CREATE POLICY "org_members_read_own" ON "organisation_members" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "organisation_members"."user_id");--> statement-breakpoint
CREATE POLICY "conversations_read_members" ON "conversations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from "organisation_members" m where m.user_id = (select auth.uid()) and m.org_id in ("conversations"."org_a_id", "conversations"."org_b_id")));--> statement-breakpoint
CREATE POLICY "messages_read_members" ON "messages" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from "conversations" c join "organisation_members" m on m.org_id in (c.org_a_id, c.org_b_id) where c.id = "messages"."conversation_id" and m.user_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "notifications_read_own" ON "notifications" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "notifications"."user_id");