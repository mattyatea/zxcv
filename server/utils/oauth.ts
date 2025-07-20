import { GitHub, Google } from "arctic";
import type { CloudflareEnv } from "../types/env";

export function createOAuthProviders(env: CloudflareEnv) {
	const baseUrl = env.APP_URL || "http://localhost:3000";

	const google = new Google(
		env.GOOGLE_CLIENT_ID || "",
		env.GOOGLE_CLIENT_SECRET || "",
		`${baseUrl}/api/auth/callback/google`,
	);

	const github = new GitHub(
		env.GH_OAUTH_CLIENT_ID || "",
		env.GH_OAUTH_CLIENT_SECRET || "",
		`${baseUrl}/api/auth/callback/github`,
	);

	return { google, github };
}

export function generateState(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateCodeVerifier(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return btoa(String.fromCharCode(...array))
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}
