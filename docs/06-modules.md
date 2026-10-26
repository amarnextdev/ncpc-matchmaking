# 06 · Modules (work in this order)

Status: ✅ done · 🔄 in progress · ⏳ next · ▫️ later

| # | Module | Status | Scope |
| --- | --- | --- | --- |
| 1 | Project setup | ✅ | Next.js, Tailwind v4, shadcn, theme tokens, header/footer, ComingSoon routes, config, Supabase/Drizzle clients, middleware |
| 2 | Database schema | ⏳ | All tables in Drizzle, migrations, RLS policies, demo seed |
| 3 | Auth | ▫️ | Sign in, register account, verify email, forgot/reset password, signed-in header (bell, My workspace, avatar), route guards |
| 4 | Organisation onboarding | ▫️ | 4-step form: company, matchmaking info (fixed tags), logo/banner, documents → pending |
| 5 | Admin approvals | ▫️ | Admin layout, approvals list, approve/reject with reason, emails |
| 6 | Organisations | 🟡 | Directory + filters, profile (about, offers/needs, projects, verified partners). **Directory + profile built on demo data**; needs DB + auth. |
| 7 | Projects + Opportunities | 🟡 | Create/edit project, photos, updates, documents; Opportunities list + detail (approved designs). **Opportunities list page built on demo data** (src/features/opportunities/data); detail page next. |
| 8 | Matchmaking engine | ▫️ | Role matrix, scoring, reasons, Recommended tab, match % on cards |
| 9 | Enquiries + deal room | ▫️ | Send/accept/decline/expire, threads, realtime messages, files, deal status, notes |
| 10 | Agreements + tracking | ▫️ | Propose/confirm agreements, project partners, portfolio, funding bar |
| 11 | Notifications | ▫️ | Bell, toast, page, Resend emails, settings, cron |
| 12 | My workspace | ▫️ | Overview: action needed, pipeline, recommended, my projects |
| 13 | Funding offers | 🟡 | Offers list/detail, post + approve, project matching — list + offer detail built on demo data (23 Oct); post/approve, apply dialog and matching pending |
| 14 | Admin introductions + insights | ▫️ | Introduce A↔B, funnel, totals, CSV export |
| 15 | Demo data + deploy | ▫️ | Demo orgs per category, projects, deals; Vercel; final QA |

Per module: discuss → design → review → build → test (feature + design, 1440 & 390) → improve → sign-off.
Landing page is designed later; until then "/" redirects to /opportunities.
