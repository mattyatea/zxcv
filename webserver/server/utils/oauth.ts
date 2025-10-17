import { GitHub, Google } from "arctic";
import type { CloudflareEnv } from "../types/env";

export function createOAuthProviders(env: CloudflareEnv) {
	const baseUrl = env.APP_URL || "http://localhost:3000";

	const google = new Google(
		env.GOOGLE_CLIENT_ID || "",
		env.GOOGLE_CLIENT_SECRET || "",
		`${baseUrl}/auth/callback/google`,
	);

	const github = new GitHub(
		env.GH_OAUTH_CLIENT_ID || "",
		env.GH_OAUTH_CLIENT_SECRET || "",
		`${baseUrl}/auth/callback/github`,
	);

	return { google, github };
}

export function generateState(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
}

// Generate HMAC signature for state validation
export async function generateStateSignature(
	state: string,
	secret: string,
): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(state),
	);
	return btoa(String.fromCharCode(...new Uint8Array(signature)))
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

// Verify HMAC signature for state validation
export async function verifyStateSignature(
	state: string,
	signature: string,
	secret: string,
): Promise<boolean> {
	try {
		const expectedSignature = await generateStateSignature(state, secret);
		return safeCompare(expectedSignature, signature);
	} catch {
		return false;
	}
}

// Constant-time string comparison to prevent timing attacks
export function safeCompare(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

export function generateCodeVerifier(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return btoa(String.fromCharCode(...array))
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}
