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
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
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
