/**
 * Seed script for Eden's Production
 *
 * Run with: bun run scripts/seed.ts
 *
 * This script seeds the database with:
 * - Crew email allowlist
 * - Initial locations
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  console.error("Make sure you have a .env.local file with the Convex URL");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Default crew emails to seed (customize these)
const DEFAULT_CREW_EMAILS = [
  "admin@example.com",
  // Add more emails here
];

// Default locations to seed (customize these)
const DEFAULT_LOCATIONS = [
  "Warehouse A",
  "Warehouse B",
  "Office",
  "Studio 1",
  "Studio 2",
  "Storage",
];

async function seedCrewEmails(emails: string[]) {
  console.log("\n📧 Seeding crew emails...");

  for (const email of emails) {
    try {
      await client.mutation(api.crewEmails.add, { email });
      console.log(`  ✓ Added: ${email}`);
    } catch (error) {
      console.log(`  ⚠ Skipped (may already exist): ${email}`);
    }
  }
}

async function seedLocations(locations: string[]) {
  console.log("\n📍 Seeding locations...");

  for (const name of locations) {
    try {
      await client.mutation(api.locations.create, { name });
      console.log(`  ✓ Created: ${name}`);
    } catch (error) {
      console.log(`  ⚠ Skipped (may already exist): ${name}`);
    }
  }
}

async function main() {
  console.log("🌱 Eden's Production - Database Seeding");
  console.log("========================================");
  console.log(`Convex URL: ${CONVEX_URL}`);

  // Get emails from command line args or use defaults
  const emailArgs = process.argv.slice(2).filter((arg) => arg.includes("@"));
  const emails = emailArgs.length > 0 ? emailArgs : DEFAULT_CREW_EMAILS;

  await seedCrewEmails(emails);
  await seedLocations(DEFAULT_LOCATIONS);

  console.log("\n✅ Seeding complete!");
  console.log("\nNext steps:");
  console.log("1. Update DEFAULT_CREW_EMAILS in this script with your team's emails");
  console.log("2. Run the script again: bun run scripts/seed.ts");
  console.log("3. Or add emails via CLI: bun run scripts/seed.ts user@example.com");
}

main().catch((error) => {
  console.error("\n❌ Seeding failed:", error);
  process.exit(1);
});



