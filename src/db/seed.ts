/**
 * Demo data loader. Filled in Module 2 (Database) and Module 15 (Demo data).
 * Run with: npm run db:seed
 */
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  console.log("Nothing to seed yet. Demo data is added in a later module.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
