import { applyD1Migrations, env } from "cloudflare:test";

// Setup files run outside isolated storage, and may be run multiple times.
// `applyD1Migrations()` only applies migrations that haven't already been
// applied, therefore it is safe to call this function here.
console.log("Applying migrations...");
try {
  await applyD1Migrations(env.DB, env.MIGRATIONS);
  console.log("Migrations applied successfully");
} catch (error) {
  console.error("Failed to apply migrations:", error);
  throw error;
}
