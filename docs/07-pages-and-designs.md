# 07 · Pages and approved designs

Design canvases (claude.ai artifacts, private to the owner):
- Opportunities module (approved): https://claude.ai/artifact/PtvCaCYicMs4jSNpomsY5s
  Frames: Opportunities (desktop), Opportunity detail (desktop, interactive), Coming soon,
  Opportunities mobile, Detail mobile, Detail for a new project (empty states).
- Early marketplace + workspace exploration: https://claude.ai/artifact/6oEqwchysuTeduF5TB2JuQ
- Matchmaking explainer for the client: https://claude.ai/code/artifact/c62f8cfd-54e4-4c6b-9cb6-6c107a3abb65

## Page inventory (~38)
Public (~11): Home/landing (later), Opportunities, Opportunity detail, Organisations, Organisation
profile, Funding, Funding offer, How it works/About, Contact, Privacy, Terms.
Auth (7 small): Sign in, Register, Verify email, Account ready, Forgot password, Reset password, Password changed.
Workspace (~10): Onboarding + pending screen, Overview, Recommended, Enquiries (list + deal room),
My projects, Project create/edit, Organisation, Funding offers (funders), Notifications, Settings.
Admin (~10): Overview, Approvals, Organisations, Projects, Funding offers, Introductions, Insights,
Users, Settings (categories, tags, weights), Contact enquiries.

## Opportunities list (approved)
- Navy hero: breadcrumb, H1 "Investment and partnership opportunities", one-line description;
  right: stats panel (Open projects · Capital sought · Provinces) with translucent border.
- Search card overlapping the hero bottom: search input with icon, Theme select, Province select,
  Search button; divider; "Popular searches" chips (Solar PV, Battery storage, Water recycling…).
- Sticky left filters (Theme, Looking for, Stage with counts; Province; Capital needed); "Clear all".
  Mobile: "Filters · 2" + Sort buttons → bottom Sheet.
- Results header: row 1 "24 opportunities" + Get alerts + grid/list toggle + Sort (Best match,
  Newest, Capital needed, Most funded); row 2 active filter chips + "Clear filters".
- Visitor banner: "See how well each project fits you… Register free".
- Card: banner (156px, cover photo) with only the match badge (white, navy text) top-right and the
  owner logo tile overlapping bottom-left; eyebrow "THEME · PROVINCE"; title; "by Owner · Verified";
  2 facts (Capital needed big | Stage); funding bar + "R10m raised · 55% funded";
  "Looking for:" neutral chips; "View opportunity" (navy) + bookmark Save icon button.
- Numbered pagination: "Showing 1–12 of 24" + ‹ Prev 1 2 Next › (hidden if ≤ 12 results).
- States: skeleton cards while loading; empty state "No opportunities match your filters" + Clear filters.

## Opportunity detail (approved)
- Gallery: 1 large + 4 small, "Show all 12 photos", lightbox (counter, arrows, thumbnails);
  mobile single image + "1 / 12" + dots.
- Title block: neutral theme tags, H1, owner logo + "by Owner", NCPC verified, location, listed date.
- Sticky section tabs: Overview · Looking for · Progress · Partners · Documents.
- Sections on a white page separated by spacing (no borders between sections):
  About (+ key facts: Technology, Capacity, Site, Contract) · What we're looking for (tinted cards:
  Investor on navy-soft, Off-taker on green-soft, big value, footer facts) · Progress (stepper in a
  subtle panel + "Current stage" card with stage metric bar, latest update with photo thumbnails,
  "See all 6 updates from the owner →" opens a right Sheet: stage filter chips, timeline, photos,
  PDFs, Send enquiry footer; bottom sheet on mobile) · Project partners (tiles) · Documents
  (public download; locked "shared after an enquiry is accepted") · Similar opportunities (3 cards).
- Sticky right sidebar: funding card (capital raised, bar, "R8m still needed · closes [DATE]",
  "Backed by …", key facts, Expected impact list with icons, "Your match 88%" box with reasons,
  Send enquiry, Save); Project owner card (logo, verified, role, location, one line, Projects/
  Partners/Since stats, offers chips, website, reply time, "View organisation profile").
- Visitor: no match box; "Sign in to send enquiry" + "Register your organisation".
- New project (no partners yet): "New listing" badge; single concept image; stepper at stage 2;
  "No progress updates yet…"; partners empty state "No partners yet. Be the first." + Send enquiry;
  funding "No funding committed yet · open to first investors" + "Early opportunity" note;
  hide sections with nothing to show (similar, backed by, see all updates).

## Coming soon (built)
`<ComingSoon title description icon backHref backLabel />` inside the normal layout.

## Next designs to make (Opportunities module)
Send enquiry dialog · Sign-in required dialog · empty/loading states · mobile filter sheet ·
then later list view, Get alerts dialog, map view, compare.

> **Change (22 Oct):** Opportunities filters moved from the left sidebar to a horizontal filter bar above the results (pill dropdowns: Theme, Looking for, Stage, Province, Capital + Sort). Cards use the full width (3 per row at 1440). Mobile keeps the "Filters · N" bottom sheet.

> **Change (22 Oct, later):** Back to the left sidebar, now an accordion: Theme open by default, Looking for / Stage / Province / Capital closed (a group with an active filter also opens; a count badge shows how many are selected). Sort uses the shadcn Select. The filter-bar experiment was dropped.

> **Built (23 Oct):** Opportunity detail page in code at /opportunities/[slug] (src/features/opportunities/components/detail/*). Demo content in data/mock-opportunity-details.ts: "solar-rooftop-battery-storage" = full page, "textile-park-water-recycling" = new listing; other projects use defaults from queries.ts buildDetail(). Viewer is a visitor until Auth.

## Organisations module (design in review, 23 Oct)
Canvas: https://claude.ai/artifact/C8Le2DNmm2RDKCKhJitrAS
Frames: Organisations list (category pill tabs + accordion filters + org cards with role-specific key facts), Organisation profile (Role tweak: Investor / Industrial park / Technology provider; sections About, What we offer, What we are looking for, role section, Track record with stage bars, Impact, Documents, Similar; sidebar Match, Contact (locked until enquiry accepted), Verified by NCPC), New member profile (empty states), mobile 390 for list and profile.
Decisions assumed: card grid; contact details only after an accepted enquiry; role-specific section; B-BBEE level shown (confirm with NCPC).

> **Built (23 Oct):** Organisations directory (/organisations) and profile (/organisations/[slug]) in code, from the approved canvas (2 cards per row, banner cards, navy primary match card, 220px cover). Demo data: features/organisations/data. Showcase profiles: sunridge-capital (investor), riverside-industrial-park (park), solartech-sa (technology), aquacycle-solutions (new member). "Verified only" filter dropped: only verified organisations are listed. Shared building blocks added in src/components/shared: marketplace-hero, pagination, visitor-banner, section-tabs, detail-section, file-badge, enquiry-button, share-button, filters/facet-accordion; generic URL filter hook src/hooks/use-filter-params.ts.

> **Track record at scale (23 Oct):** profile shows stage summary pills + the latest 5 projects in a table (Project · Role · Stage · Since); "View all N projects" opens /organisations/[slug]/projects with search, stage tabs, role filter, sort and pagination (10 per page). Rows listed on the platform open the opportunity page.

> **Projects page redesign (23 Oct, approved canvas):** /organisations/[slug]/projects now follows the list-page pattern: navy TrackHero (org chip, 2×2 stats with colour dots), overlapping search card (+ role filter when the org has several roles), status pill tabs, results bar + sort, TrackProjectCard grid (3 per row, 12 per page), pagination. The profile keeps the compact table preview.

## Funding module (design approved, built 23 Oct)
Canvas: https://claude.ai/artifact/VpXPjUFuJsbzmLS7Baso1G
Funding = money looking for projects (reverse of Opportunities). Offers posted by verified investors/funders and NCPC admin; NCPC approves (Draft → Pending → Live → Closed). Members apply with one of their listed projects; the agreement and money happen off-platform, then both confirm the deal (project "raised" + funder portfolio update).
Frames: Funding list (type tabs Grants/Loans/Equity/Blended/Guarantees/Closed, filters incl. "Only offers I qualify for", offer cards with type-coloured banner showing the amount + deadline chip, "Your project qualifies" line), Offer detail (Green Industry Loan: key facts, About + what we fund, eligibility checklist + per-project eligibility check, terms table, 4-step how-to-apply with timings + documents, funded so far, similar offers; navy sidebar "Apply with [project]" + funder card), mobile 390 for both.

Funding — built (23 Oct): `/funding` (hero with amber "Closing in 30 days", search card with Theme + Amount, type tabs with colour swatches, sidebar accordion: Themes/Amount/Stage funded/Who can apply/Province/Deadline + member-only "Only offers I qualify for", member/visitor banner, offer cards 2 per row, pagination) and `/funding/[slug]` (type-coloured header with dot pattern, green "Approved by NCPC" seal after the H1, 4 key facts, sticky tabs, About + what we fund, Who can apply + per-project eligibility check, Terms, vertical How-to-apply timeline + documents, Funded so far, FAQ accordion, Similar offers; navy Apply card, funder card, safety note). Code: `src/features/funding`. `VerifiedBadge` now takes `label` (and size `xl`).

## Collaboration module (design in review, 26 Oct)
Canvas: https://claude.ai/artifact/TUnGKt2iv2grsYiqtvAaEr
Agreed flow: Send enquiry (note, "enquiring as" role from the project's Looking for) → owner accepts → organisations connected → Messages (LinkedIn-style: one chat per organisation pair) with a Deal panel per project (stage, documents Requested → Uploaded → Reviewed, meetings, key terms, private notes, contact) → owner sends a collaboration request (one form, role-specific fields) → partner accepts → partnership shows on project, both profiles and workspaces. Already connected: "Message" / "Start a deal" instead of Send enquiry. "Found" on Looking for is set automatically when a partnership is confirmed (investor: when capital is fully raised).
Frames: Send enquiry dialog + sent state, Messages investor view + owner view, mobile 390 (enquiry sheet, list, chat, deal panel). Next: My network page (Connections · Received · Sent), collaboration request form + accept view.
