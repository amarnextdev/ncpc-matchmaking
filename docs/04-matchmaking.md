# 04 · Matchmaking, enquiries, agreements, progress

## What gets matched
Organisation ↔ Organisation, Organisation ↔ Project (and later Project ↔ Funding offer).
Score is calculated live when the page loads (fine up to ~1000 organisations); store later if needed.

## Role matrix (only these pairs are matched; same role does not match)
| Role | Matches with |
| --- | --- |
| Project developer | Investor, Funder, Technology provider, ESCO, Industrial park/SEZ |
| Investor | Project developer, Property developer |
| Funder | Project developer, ESCO, Property developer |
| Industrial park / SEZ | Tenant, Property developer, ESCO, Technology provider |
| Tenant | Industrial park/SEZ, ESCO, Technology provider |
| Property developer | Industrial park/SEZ, Investor, Funder |
| ESCO | Tenant, Industrial park/SEZ, Funder |
| Technology provider | Project developer, Industrial park/SEZ, Tenant, ESCO |

## Score (0–100)
| Check | Points |
| --- | --- |
| Role fit (pair in matrix) | 25 |
| Needs ↔ offers overlap (both directions) | 25 |
| Theme overlap | 20 |
| Same province | 10 (points only, never a hard filter) |
| Project stage within partner's stages | 10 |
| Amount within investment range | 10 |
70+ "Strong", 40–69 "Good", below 40 hidden. Every match shows plain-language reasons,
e.g. "You need an investor; they invest R5m–R30m in energy". Offers/needs use a **fixed tag list**
(~20–25 tags: Equity, Loan, Grant, EPC contractor, Energy audit, O&M, Solar PV, Battery storage,
Water recycling, Biogas, Green hydrogen, Industrial land, Factory space, Off-taker…) — never free text.

## Enquiry flow
Send enquiry (optional note, shows score/reasons) → recipient notified (bell + email) →
Accept / Decline ("Not available right now", no reason) / expires after 30 days.
Accepted → deal room thread opens. Messages only after acceptance or an NCPC introduction.

## Deal room (not social chat)
Realtime messages + file/image attachments, deal status select (In discussion → Due diligence →
Agreement → Closed), shared documents list, private notes (own organisation only), block/report.
No typing indicator, no online status, no read ticks.

## Agreements (verified partnerships)
"Propose agreement": project, type (Investment · Loan/Grant · Technology supply · Site host ·
Tenant · Energy service · Construction), amount (optional, public on/off) → other side confirms →
Verified. Shows on project "Project partners", organisation portfolio, funding bar. Either side can
hide from public.

## Project progress
Five fixed stages: Idea → Feasibility → Funding → Construction → Operational.
Detail page shows a stepper + "Current stage" card (current stage, started, next stage, a stage
metric like "Roofs completed 2 of 4", latest update with photos, "See all updates" drawer).
Owner posts updates (title, text, stage, photos, documents). Funding bar = sum of verified
investment amounts / capital needed.

## NCPC role
Approves organisations, introduces A ↔ B (both accept → thread opens with NCPC intro), sees funnel:
Matches → Enquiries → Accepted → Agreements → Active, total investment, top themes/sectors.
