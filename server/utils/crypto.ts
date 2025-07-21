const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
	// Use PBKDF2 for password hashing (more secure than SHA-256)
	const encoder = new TextEncoder();
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits"],
	);

	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt,
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		256,
	);

	// Combine salt and hash
	const hashArray = new Uint8Array(derivedBits);
	const combined = new Uint8Array(salt.length + hashArray.length);
	combined.set(salt);
	combined.set(hashArray, salt.length);

	return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	try {
		const encoder = new TextEncoder();
		const combined = new Uint8Array(
			atob(storedHash)
				.split("")
				.map((char) => char.charCodeAt(0)),
		);

		// Extract salt and hash
		const salt = combined.slice(0, 16);
		const hash = combined.slice(16);

		// Derive key from password with same salt
		const keyMaterial = await crypto.subtle.importKey(
			"raw",
			encoder.encode(password),
			{ name: "PBKDF2" },
			false,
			["deriveBits"],
		);

		const derivedBits = await crypto.subtle.deriveBits(
			{
				name: "PBKDF2",
				salt,
				iterations: 100000,
				hash: "SHA-256",
			},
			keyMaterial,
			256,
		);

		const testHash = new Uint8Array(derivedBits);

		// Compare hashes
		if (hash.length !== testHash.length) {
			return false;
		}
		for (let i = 0; i < hash.length; i++) {
			if (hash[i] !== testHash[i]) {
				return false;
			}
		}
		return true;
	} catch {
		return false;
	}
}

export function generateId(): string {
	return crypto.randomUUID();
}

export async function hashApiKey(key: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(key);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
