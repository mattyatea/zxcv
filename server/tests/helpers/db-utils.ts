import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

// Create a Prisma client specifically for tests that bypasses the Nuxt build
export function createTestPrismaClient(db: D1Database) {
	const adapter = new PrismaD1(db);
	return new PrismaClient({ adapter });
}

// Helper to clean up test data
export async function cleanupTestData(db: PrismaClient) {
	// Delete in correct order to respect foreign key constraints
	await db.ruleStar.deleteMany();
	await db.ruleDownload.deleteMany();
	await db.ruleVersion.deleteMany();
	await db.rule.deleteMany();
	await db.apiKey.deleteMany();
	await db.organizationMember.deleteMany();
	await db.organizationInvitation.deleteMany();
	await db.passwordReset.deleteMany();
	await db.emailVerification.deleteMany();
	await db.oAuthAccount.deleteMany();
	await db.oAuthState.deleteMany();
	await db.user.deleteMany();
	await db.organization.deleteMany();
	await db.rateLimit.deleteMany();
}