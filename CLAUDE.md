# NCPC Matchmaking — project memory for Claude

This file is loaded automatically in every Claude Code session. Read the linked docs before
changing anything in that area. Keep this file and `docs/` updated when a decision changes.

## What this is
A professional B2B **investment and partnership marketplace** for sustainable industrial projects in
South Africa, run by the **National Cleaner Production Centre (NCPC)**, hosted by the CSIR.
Organisations (investors, funders, project developers, industrial parks, SEZs, tenants, property
developers, ESCOs, technology providers) register, NCPC approves them, the platform recommends
matches, members send enquiries, agree partnerships, and track project progress.
It must feel like a **professional deal-facilitation platform, not a social network**.

## Stack (decided — do not change without asking)
Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Radix) ·
lucide-react · Zod · Drizzle ORM (server only) · Supabase (Postgres, Auth, Storage, Realtime) ·
Resend (email, later) · Vercel (hosting, later). Single normal repo (no monorepo).

## How we work (always)
1. Work **one module at a time**, in the order in `docs/06-modules.md`.
2. For each module: discuss → design pages → user reviews → build → test (feature + design,
   desktop 1440 and mobile 390) → improve → user signs off → next module.
3. Pages not built yet return `<ComingSoon title="…" />`.
4. The user speaks Hinglish; reply in simple Hinglish, keep UI copy in professional English.

## Hard rules
- Routes only from `@/config/routes`; nav from `@/config/site`; fixed lists from `@/lib/constants`.
- Logo only via `<BrandLogo />` (`tone="white"` on navy backgrounds). Never stretch it.
- Colours only via theme tokens (`bg-primary`, `text-muted-foreground`, `bg-success-soft`…), never raw
  hex in components. **Navy = brand/actions. Green = only "verified" and progress/funding bars.**
- `@/db` (Drizzle) is server-only. Every Server Action starts with an auth/ownership check
  (Drizzle bypasses Supabase RLS). Keep RLS on for browser-side Supabase calls.
- Feature code lives in `src/features/<area>/` (components, actions.ts, queries.ts, schemas.ts).
  Pages in `src/app` stay thin.
- Reuse before creating: check `src/components/{ui,layout,shared,brand}` first.
- No social-network features: no feeds, likes, followers, online status, typing indicators.
- Never put secrets in code or chat. Env vars only in `.env.local`.
- Accessibility: real buttons/links/labels, 44px touch targets, 4.5:1 text contrast.

## Docs (read the one you need)
- @docs/01-product.md — product, users, flows, wording
- @docs/02-design-system.md — tokens, typography, components, layout patterns
- @docs/03-architecture.md — folders, conventions, data access, security
- @docs/04-matchmaking.md — role matrix, scoring, enquiries, agreements, progress
- @docs/05-data-model.md — planned tables
- @docs/06-modules.md — module list and status
- @docs/07-pages-and-designs.md — every page and the approved designs

## Commands
`npm run dev` · `npm run lint` · `npm run typecheck` · `npm run format` ·
`npm run db:generate` · `npm run db:migrate` · `npm run db:studio` · `npx shadcn@latest add <component>`
