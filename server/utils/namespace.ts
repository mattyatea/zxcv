import { ORPCError } from "@orpc/server";
import type { PrismaClient } from "@prisma/client";

export function parseRulePath(path: string): {
	owner?: string;
	ruleName: string;
} | null {
	// Check if path is valid
	if (!path || path.trim() === "") {
		return null;
	}

	// Remove leading @ if present
	const cleanPath = path.startsWith("@") ? path.substring(1) : path;

	// Split by /
	const parts = cleanPath.split("/");

	if (parts.length === 1 && parts[0]) {
		// Simple rule name without owner
		return {
			ruleName: parts[0],
		};
	} else if (parts.length === 2 && parts[0] && parts[1]) {
		// Owner/rule format
		return {
			owner: parts[0],
			ruleName: parts[1],
		};
	} else if (parts.length === 2) {
		// Invalid formats like "owner/" or "/rule"
		return null;
	}

	// Invalid paths with more than 2 parts
	return null;
}

export async function validateRuleOwnership(
	prisma: PrismaClient,
	owner: string,
): Promise<{ userId?: string; organizationId?: string }> {
	// First check if it's a user
	const user = await prisma.user.findUnique({
		where: { username: owner },
		select: { id: true },
	});

	if (user) {
		return { userId: user.id };
	}

	// Then check if it's an organization
	const organization = await prisma.organization.findUnique({
		where: { name: owner },
		select: { id: true },
	});

	if (organization) {
		return { organizationId: organization.id };
	}

	throw new ORPCError("NOT_FOUND", {
		message: `Owner '${owner}' not found`,
	});
}

export async function checkNamespaceAvailable(
	prisma: PrismaClient,
	name: string,
): Promise<boolean> {
	// Check if username exists
	const user = await prisma.user.findUnique({
		where: { username: name },
		select: { id: true },
	});

	if (user) {
		return false;
	}

	// Check if organization name exists
	const organization = await prisma.organization.findUnique({
		where: { name: name },
		select: { id: true },
	});

	return !organization;
}
