# NCPC Matchmaking

Investment and partnership marketplace for sustainable industrial projects in South Africa, run by the
National Cleaner Production Centre (NCPC).

## Tech stack

| Area | Tool |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) |
| Database | PostgreSQL on Supabase, queried with Drizzle ORM |
| Auth, files, realtime | Supabase Auth, Storage, Realtime |
| Validation | Zod |
| Email (later) | Resend |
| Hosting (later) | Vercel |

## Getting started

Requirements: Node.js 20.9 or newer, npm, Git.

```bash
npm install
cp .env.example .env.local   # on Windows: copy .env.example .env.local
npm run dev
```

Open http://localhost:3000. The app runs without Supabase keys; pages that need a database
show "Coming soon" until their module is built.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run format` | Prettier |
| `npm run db:generate` | Create a SQL migration from the Drizzle schema |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:studio` | Browse the database |
| `npm run db:seed` | Load demo data |

## Adding shadcn/ui components

```bash
npx shadcn@latest add dialog sheet select checkbox tabs progress tooltip
```

Components land in `src/components/ui` and pick up the NCPC theme from `src/app/globals.css`.

## Folder structure

```
src/
├── app/                        Routes only (thin pages)
│   ├── (public)/               Website: header + footer
│   │   ├── opportunities/      List + [slug] detail
│   │   ├── organisations/      List + [slug] profile
│   │   ├── funding/            List + [slug] offer
│   │   ├── about, contact, privacy, terms
│   │   └── workspace/          Member area (same header + tabs), login required
│   ├── (auth)/                 sign-in, register, forgot-password, reset-password
│   ├── admin/                  NCPC admin panel (navy sidebar)
│   ├── layout.tsx              Root: font, metadata
│   ├── globals.css             Design tokens (NCPC theme)
│   ├── not-found.tsx, error.tsx
├── components/
│   ├── ui/                     shadcn/ui primitives (Button, Card, Badge…)
│   ├── layout/                 SiteHeader, SiteFooter, MainNav, WorkspaceTabs, AdminSidebar, Container
│   ├── shared/                 ComingSoon, EmptyState, PageHeader
│   └── brand/                  BrandLogo
├── features/                   Business logic per area (see features/README.md)
├── db/                         Drizzle client, schema, seed (server only)
├── lib/                        utils, env, constants, supabase clients
├── config/                     routes, site config and navigation
├── hooks/                      Shared React hooks
├── types/                      Shared types
└── middleware.ts               Session refresh + protects /workspace and /admin
public/brand/                   NCPC logos (blue, white, mark)
drizzle/                        Generated SQL migrations
```

## Conventions

- **Routes**: never hard-code a path; use `routes` from `@/config/routes`.
- **Logo**: always `<BrandLogo />` (`tone="white"` on navy).
- **Colours**: use theme classes (`bg-primary`, `text-muted-foreground`, `bg-success-soft`), never raw hex in components.
  Navy is for brand and actions; green only for "verified" and progress.
- **Pages not built yet**: return `<ComingSoon title="…" />`.
- **Database**: `@/db` is server-only. Every Server Action checks the user first.
- **Secrets**: only in `.env.local`, never committed.

## Build plan (modules)

1. Project setup ✅
2. Database schema
3. Auth
4. Organisation onboarding
5. Admin approvals
6. Organisations directory + profile
7. Projects + Opportunities
8. Matchmaking engine
9. Enquiries + deal room
10. Agreements + tracking
11. Notifications
12. My workspace
13. Funding offers
14. Admin introductions + insights
15. Demo data + deploy
