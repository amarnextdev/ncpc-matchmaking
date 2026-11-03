# 05 · Data model (Module 2)

> **Written 3 Nov 2026** in `src/db/schema/` (enums, users, files, organisations, projects,
> collaboration, funding, notifications). The table below is the original plan; the code is the truth.
> Changes vs plan: all uploads in `files` (Supabase Storage bucket + path); `project_needs` has
> open/found per role; collaboration = `enquiries` (role, 300-char note, 30-day expiry) →
> `conversations` (one per org pair) → `deals` (one per project, owner moves stage) →
> `collaboration_requests` (+ versions, role form in jsonb) → `partnerships` (both confirm, adds to
> `projects.capital_raised`). RLS on for every table; browser policies only for profiles, memberships,
> conversations, messages and notifications (Realtime).

PostgreSQL via Drizzle. One schema file per area in `src/db/schema/`, re-exported from `index.ts`.
Arrays (`text[]`) for tags with GIN indexes; enums for categories/status/stages.

| Table | Key columns |
| --- | --- |
| `profiles` | id (= auth.users.id), full_name, phone, job_title, role ('member' \| 'admin') |
| `organisations` | id, slug, owner_id, name, category, registration_no, website, province, city, about, logo_path, banner_path, offers[], needs[], themes[], technologies[], stages[], invest_min, invest_max, status ('draft'\|'pending'\|'approved'\|'rejected'), reject_reason, approved_at |
| `organisation_members` | org_id, user_id, role ('owner'\|'member') |
| `organisation_documents` | id, org_id, type, file_path, file_name |
| `projects` | id, slug, org_id, title, summary, description, theme, technologies[], province, site, capital_needed, stage, looking_for[], status, listed_at |
| `project_needs` | id, project_id, kind (investor/off_taker/…), headline, amount, notes, status ('open'\|'filled') |
| `project_media` | id, project_id, storage_path, caption, is_cover, sort_order, update_id (nullable) |
| `project_updates` | id, project_id, stage, title, body, created_by, created_at |
| `project_documents` | id, project_id, name, file_path, visibility ('public'\|'members_after_enquiry') |
| `enquiries` | id, from_org, to_org, project_id, note, match_score, status ('pending'\|'accepted'\|'declined'\|'expired'\|'withdrawn'), deal_status, created_at, responded_at |
| `conversations` / `conversation_members` | id, enquiry_id / conversation_id, org_id, last_read_at |
| `messages` | id, conversation_id, sender_user_id, sender_org_id, body, attachment_path, attachment_name, attachment_type, attachment_size, created_at |
| `private_notes` | id, enquiry_id, org_id, body |
| `agreements` | id, project_id, partner_org_id, type, amount, amount_public, status ('proposed'\|'confirmed'\|'active'\|'completed'\|'cancelled'), proposed_by, confirmed_at |
| `introductions` | id, org_a, org_b, project_id, reason, created_by, status_a, status_b |
| `funding_offers` | id, provider_org_id, title, type, amount_min, amount_max, themes[], stages[], eligible_categories[], deadline, status |
| `notifications` | id, user_id, type, title, body, link, read_at, created_at |
| `notification_settings` | user_id, email_enquiries, email_messages, email_digest… |
| `saved_items` | user_id, item_type, item_id |
