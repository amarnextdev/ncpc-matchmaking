# 03 · Architecture and conventions

## Folders
```
src/app/(public)/        website pages (header + footer); workspace/ lives here too (login required)
src/app/(auth)/          sign-in, register, forgot/reset password
src/app/admin/           NCPC admin (navy sidebar)
src/components/ui/       shadcn primitives (add with `npx shadcn@latest add …`)
src/components/layout/   SiteHeader (TopBar, HeaderShell, BrandLockup, MainNav, HeaderActions, MobileNav),
                         SiteFooter, WorkspaceTabs, AdminSidebar, Container
src/components/shared/   ComingSoon, EmptyState, PageHeader
src/components/brand/    BrandLogo
src/features/<area>/     components/, actions.ts, queries.ts, schemas.ts, types.ts, utils.ts
src/db/                  Drizzle client (server only), schema/, seed.ts
src/lib/                 utils (cn, formatRand, initials, slugify), env, constants, supabase/{client,server,middleware}
src/config/              routes.ts (all URLs), site.ts (site info + all navigation)
src/middleware.ts        refreshes Supabase session; /workspace and /admin need login
```
Feature areas: auth, organisations, projects, opportunities, matching, enquiries, agreements,
notifications, funding, admin.

## Data access
- Reads: Server Components call `features/<area>/queries.ts` (Drizzle).
- Writes: Server Actions in `features/<area>/actions.ts` ("use server"), validated with Zod,
  starting with `requireUser()` / `requireOrgMember(orgId)` / `requireAdmin()`.
- Browser uses Supabase client only for Realtime (messages, notifications) and signed uploads.
- Drizzle connects through the Supabase transaction pooler (port 6543, `prepare: false`).
- RLS policies stay on for every table (for browser-side Supabase calls).

## Files (Supabase Storage, decided 3 Nov 2026)
Two buckets. Rules per upload kind live in `src/lib/storage/kinds.ts`.
- **public-images** (public): logo, banner, project photos. Resized in the browser before upload
  (logo 512px, others 1600px, WebP). Shown with `publicImageUrl(path)` through `next/image`.
- **private-documents** (private): verification docs, project/deal documents, message attachments.
  Opened only through `privateFileUrl(path)` (signed, 10 min) after the server checks the viewer.
- Flow: browser → `POST /api/uploads/sign` (signed-in only; server picks the path
  `<owner id>/<kind>/<uuid>.<ext>`) → browser uploads to the one-time signed URL → Server Action
  checks `isOwnedPath()` + `statObject()` (real size/type) before saving a `files` row.
- Signing uses the server-only secret key (`src/lib/supabase/admin.ts`), only for Storage.
- Max 5–10 MB depending on kind (also set as bucket limits).

## Notifications
In-app: `notifications` table + Realtime → bell dropdown + Sonner toast + /workspace/notifications.
Email: Resend; offline users get message emails batched every 15 min; weekly match digest
(Vercel Cron). Users can turn email types off. Web push later.

## Quality
`npm run lint`, `npm run typecheck` must pass. Test every page at 1440 and 390 widths.
Empty, loading (Skeleton) and error states for every list.
