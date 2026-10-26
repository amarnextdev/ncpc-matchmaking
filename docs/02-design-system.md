# 02 · Design system — "Clean institutional B2B"

Feel: trustworthy, clean, data-focused (IRENA, World Bank, Stripe, Crunchbase). Not social, not slideware.
Tokens live in `src/app/globals.css` (shadcn reads them). Change a token there, not in components.

## Colour
| Token / class | Hex | Use |
| --- | --- | --- |
| `primary` | #13336B | NCPC navy: buttons, links, active states, logo tiles |
| `primary-hover` | #0B2350 | Hover, top strip |
| `primary-soft` | #EEF3FB | Highlight cards, selected states, soft badges |
| `success` | #2F6B16 | "Verified", done ticks (text/icons) |
| `success-bar` | #5FA83A | Progress and funding bars, active nav underline |
| `success-soft` | #EFF7E9 | Verified badge background, offer cards |
| `foreground` | #0F172A | Headings/body |
| `muted-foreground` | #475569 | Descriptions |
| `subtle-foreground` | #64748B | Labels, dates |
| `border` / `input` | #E2E8F0 / #CBD5E1 | Card borders / input borders |
| `surface` | #F5F7FA | List-page background |
| `surface-subtle` | #F8FAFC | Subtle panels |
| `warning` / `warning-soft` | #7A4A06 / #FFF8EC | "Action needed" |
| `destructive` | #B42318 | Errors |
Rule: max two accent colours per screen. Green never for buttons.

## Typography
Inter only. H1 32–40 · H2 22 · H3 17 · body 15–16 · small 13 · eyebrow 12 (uppercase, 0.08em,
`.text-eyebrow`). Weights: 400 body, 600 labels/buttons, 700 headings and numbers.
Rand amounts and percentages are always bold.

## Shape and space
4-pt spacing (4, 8, 12, 16, 24, 32, 48); sections 32–36px apart. Radius: **buttons are pills (rounded-full)**,
filter/status chips pills, 8 tag chips and inputs, 12 tiles, 16 cards, 20 gallery. One soft shadow (`shadow-float`) only on sticky/floating cards; elsewhere borders.
Max content width 1280px (`<Container>`).

## Components (shadcn/ui + our shared ones)
- Buttons: pill shape (rounded-full) everywhere, incl. icon buttons. Variants: primary (navy), outline,
  outline-primary, ghost, link. Height 44–50px, generous side padding.
- Badges: `soft` (navy soft), `neutral` (grey tags), `verified` (green), `warning`, `overlay` (on images).
- Inputs 44px, label above. Icons: lucide, stroke 1.5–2. Never emoji.
- Shared: `BrandLogo`, `Container`, `PageHeader`, `ComingSoon`, `EmptyState`.
- Planned shared: `OpportunityCard`, `MatchBadge`, `StageStepper`, `FundingProgress`, `OrgLogo`.

## Layout patterns
| Page type | Pattern |
| --- | --- |
| List (Opportunities, Organisations, Funding) | Grey `surface` background; navy hero; search card overlapping the hero; sticky left filters + card grid (min 300px, gap 24); numbered pagination |
| Detail (Opportunity, Organisation, Funding offer) | White continuous page (NO card around every section), sections separated by spacing only; sticky section tabs; sticky right sidebar cards |
| Workspace | Same site header + "My workspace" title + tabs (not a separate dashboard) |
| Admin | Navy sidebar + tables + small KPI cards |
| Auth | Split screen: navy panel + white form |
Cards on list pages; continuous content on detail pages.

## Header (approved)
Top strip (dark navy): "An initiative of the NCPC South Africa | Hosted by the CSIR" + Contact, Help,
ncpc.co.za. Main bar: NCPC logo | "Matchmaking / Sustainable industrial spaces", nav
(Opportunities, Organisations, Funding, About) with green underline on active, search icon,
Sign in, "Register organisation". Sticky with shadow on scroll. Signed in: bell, "My workspace", avatar.

## Images
Real project photos; placeholders = solid theme-colour block (no gradients). Project gallery:
1 large + 4 small, lightbox, mobile carousel.

## Verified badge (23 Oct)
Use `<VerifiedBadge />` (src/components/shared/verified-badge.tsx) right after an organisation name instead of writing "NCPC verified". Always green with a white tick: `#2F6B16` on light backgrounds, `tone="light"` = brighter `#5FA83A` on navy/coloured backgrounds. Sizes sm (cards, lists), md (default), lg (profile H1). Tooltip: "Verified by NCPC: company registration, B-BBEE and tax checked". The text form stays only in explanations (Verified by NCPC card, hero copy).
