/**
 * Demo data loader. Safe to run many times (rows are matched by slug).
 * Run with: npm run db:seed
 *
 * Adds organisations that are waiting for NCPC review, so the admin approvals page can be tested
 * before onboarding saves real registrations. They have no members and no documents.
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env.local" });

const DAY = 86_400_000;

const PENDING: (typeof schema.organisations.$inferInsert)[] = [
  {
    slug: "demo-sunridge-capital",
    name: "Sunridge Capital (demo)",
    category: "investor",
    status: "pending",
    registrationNo: "2016/221904/07",
    province: "western-cape",
    city: "Cape Town",
    website: "https://example.com/sunridge",
    bbbeeLevel: "Level 2",
    about: "Impact investor backing solar, storage and efficiency projects in industrial parks.",
    summary: "Equity of R5m – R30m for energy and efficiency projects.",
    themes: ["energy", "energy_efficiency"],
    instruments: ["equity"],
    stages: ["funding", "construction"],
    investMin: 5_000_000,
    investMax: 30_000_000,
    submittedAt: new Date(Date.now() - 3 * DAY),
  },
  {
    slug: "demo-greenfuture-energy",
    name: "GreenFuture Energy (demo)",
    category: "project_developer",
    status: "pending",
    registrationNo: "2019/482117/07",
    province: "gauteng",
    city: "Johannesburg",
    website: "https://example.com/greenfuture",
    bbbeeLevel: "Level 1",
    about: "Develops rooftop solar and storage for industrial parks and their tenants.",
    summary: "Rooftop solar and storage developer for industrial parks.",
    themes: ["energy"],
    offers: ["services"],
    lookingFor: ["investor", "off_taker"],
    submittedAt: new Date(Date.now() - 1 * DAY),
  },
  {
    slug: "demo-aquacycle-solutions",
    name: "AquaCycle Solutions (demo)",
    category: "technology_provider",
    status: "pending",
    registrationNo: "2021/553870/07",
    province: "western-cape",
    city: "Stellenbosch",
    bbbeeLevel: "Exempt (EME or QSE affidavit)",
    about: "Water recycling plants for textile and food processing parks.",
    summary: "Water recycling plants for industrial parks.",
    themes: ["water"],
    offers: ["technology", "services"],
    lookingFor: ["investor", "site_host"],
    submittedAt: new Date(),
  },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing in .env.local");
  const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  const db = drizzle(client, { schema, casing: "snake_case" });
  try {
    const inserted = await db
      .insert(schema.organisations)
      .values(PENDING)
      .onConflictDoNothing({ target: schema.organisations.slug })
      .returning({ name: schema.organisations.name });
    console.log(`Added ${inserted.length} demo organisation(s) waiting for review.`);
    if (inserted.length < PENDING.length) {
      console.log("The others already existed and were left as they are.");
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error && error.cause instanceof Error ? error.cause.message : error,
  );
  process.exit(1);
});
