import crypto from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { hashToken } from "./crypto";

// Generate user-friendly code (e.g., "ABCD-1234")
export function generateUserCode(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	for (let i = 0; i < 8; i++) {
		if (i === 4) {
			code += "-";
		}
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

// Generate secure device code
export function generateDeviceCode(): string {
	return crypto.randomBytes(32).toString("base64url");
}

// Generate CLI access token
export function generateCliToken(): string {
	return crypto.randomBytes(32).toString("base64url");
}

// Cleanup expired device codes
export async function cleanupExpiredDeviceCodes(
	db: PrismaClient,
): Promise<number> {
	const now = Math.floor(Date.now() / 1000);
	const result = await db.deviceCode.deleteMany({
		where: {
			expiresAt: {
				lt: now,
			},
		},
	});
	return result.count;
}

// Cleanup expired CLI tokens
export async function cleanupExpiredCliTokens(
	db: PrismaClient,
): Promise<number> {
	const now = Math.floor(Date.now() / 1000);
	const result = await db.cliToken.deleteMany({
		where: {
			expiresAt: {
				not: null,
				lt: now,
			},
		},
	});
	return result.count;
}

// Validate device code polling interval
export function shouldSlowDown(
	lastAttempt: number | null,
	interval: number,
): boolean {
	if (!lastAttempt) {
		return false;
	}
	const now = Math.floor(Date.now() / 1000);
	return now - lastAttempt < interval;
}

// Generate CLI token hash
export async function hashCliToken(token: string): Promise<string> {
	return hashToken(token);
}

// Rate limit check for device code attempts
export function isRateLimited(
	attemptCount: number,
	maxAttempts = 100,
): boolean {
	return attemptCount >= maxAttempts;
}
