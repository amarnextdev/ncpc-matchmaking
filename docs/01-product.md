# 01 · Product

## Purpose
Help NCPC turn its (today mostly offline) matchmaking work into a digital, trackable platform:
the right partners find each other, start a conversation with consent, record agreements, and
NCPC can report how many partnerships and how much investment the platform helped create.

## Users and roles
| Role | Wants |
| --- | --- |
| Visitor (not signed in) | Browse opportunities, organisations, funding; understand NCPC; register |
| Member (approved organisation) | See recommended matches, send/receive enquiries, list projects, record agreements |
| NCPC admin | Approve organisations, moderate, introduce organisations, see insights/reports |

Organisation categories (one per organisation): Investor · Funder · Project developer ·
Industrial park · Special economic zone (SEZ) · Tenant · Property developer · ESCO · Technology provider.

## Core flow (professional wording)
```
Register organisation → NCPC approval → Recommended opportunities/partners (match score + reasons)
→ Send enquiry → Enquiry accepted → In discussion (deal room: messages + documents)
→ Propose agreement → Other side confirms → Verified partnership/investment
→ Shown on project page + organisation portfolio → Project progress tracked → Completed
```
Declined enquiries show only "Not available right now". Pending enquiries expire after 30 days.
NCPC can introduce two organisations directly. NCPC admins see enquiry **status**, not message content.

## Wording rules
Use: "Send enquiry", "Enquiry accepted", "Agreement", "Verified partnership", "Recommended",
"Project partners", "Updates from the project owner".
Avoid: "Like", "Follow", "Mutual match", "Connect with friends", emojis, casual tone.

## Visitor vs signed-in
Public: opportunities list + detail, organisations, funding offers, about, contact.
Login required: match %, locked documents, send enquiry, workspace.
Locked actions show "Sign in to send enquiry" + register prompt.

## Green finance
"Funding" section = list of funding offers (grants, loans, equity, guarantees, technical assistance)
posted by Funder/Investor organisations (admin approves). Matched to projects
(theme, stage, amount range, eligible roles). Not a separate dashboard.
