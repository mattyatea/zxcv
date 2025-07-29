/**
 * Fix rules that don't have version records
 * This script scans for rules without versions and creates default version records
 */

import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

// Initialize Prisma client
const prisma = new PrismaClient();

async function hashContent(content: string): Promise<string> {
	const hash = crypto.createHash("sha256");
	hash.update(content);
	return hash.digest("hex");
}

async function main() {
	console.log("Starting fix for missing rule versions...");

	try {
		// Find rules without any versions
		const rulesWithoutVersions = await prisma.$queryRaw<
			Array<{ id: string; name: string; userId: string; createdAt: number }>
		>`
			SELECT r.id, r.name, r.user_id as userId, r.created_at as createdAt
			FROM rules r
			WHERE NOT EXISTS (
				SELECT 1 FROM rule_versions rv WHERE rv.rule_id = r.id
			)
		`;

		console.log(`Found ${rulesWithoutVersions.length} rules without versions`);

		for (const rule of rulesWithoutVersions) {
			console.log(`Processing rule: ${rule.name} (${rule.id})`);

			try {
				// Create a default version record
				const versionId = nanoid();
				const version = await prisma.ruleVersion.create({
					data: {
						id: versionId,
						ruleId: rule.id,
						versionNumber: "1.0.0",
						changelog: "Initial version (restored)",
						contentHash: "unknown", // We don't have the content here
						r2ObjectKey: `rules/${rule.id}/versions/1.0.0/content.md`,
						createdBy: rule.userId,
						createdAt: rule.createdAt,
					},
				});

				// Update the rule's latestVersionId
				await prisma.rule.update({
					where: { id: rule.id },
					data: {
						latestVersionId: versionId,
						version: "1.0.0",
					},
				});

				console.log(`✓ Created version ${version.versionNumber} for rule ${rule.name}`);
			} catch (error) {
				console.error(`✗ Failed to create version for rule ${rule.name}:`, error);
			}
		}

		// Verify the fix
		const remainingRulesWithoutVersions = await prisma.$queryRaw<Array<{ count: number }>>`
			SELECT COUNT(*) as count
			FROM rules r
			WHERE NOT EXISTS (
				SELECT 1 FROM rule_versions rv WHERE rv.rule_id = r.id
			)
		`;

		console.log(`\nRemaining rules without versions: ${remainingRulesWithoutVersions[0].count}`);
		console.log("Fix completed!");
	} catch (error) {
		console.error("Error during fix:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
