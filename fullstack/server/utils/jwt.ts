import { jwtVerify, SignJWT } from "jose";
import type { Env } from "~/server/types/env";

export interface JWTPayload {
	sub: string;
	email: string;
	username: string;
	emailVerified?: boolean;
	iat?: number;
	exp?: number;
}

export async function createJWT(
	payload: Omit<JWTPayload, "iat" | "exp">,
	env: Env,
): Promise<string> {
	const secret = new TextEncoder().encode(env.JWT_SECRET);

	const jwt = await new SignJWT(payload)
		.setProtectedHeader({ alg: env.JWT_ALGORITHM as string })
		.setIssuedAt()
		.setExpirationTime(env.JWT_EXPIRES_IN)
		.sign(secret);

	return jwt;
}

export async function verifyJWT(token: string, env: Env): Promise<JWTPayload | null> {
	try {
		const secret = new TextEncoder().encode(env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret, {
			algorithms: [env.JWT_ALGORITHM as string],
		});

		// Ensure payload has required fields
		if (payload.sub && typeof payload.email === "string" && typeof payload.username === "string") {
			return {
				sub: payload.sub,
				email: payload.email,
				username: payload.username,
				emailVerified: payload.emailVerified as boolean,
				iat: payload.iat,
				exp: payload.exp,
			};
		}

		return null;
	} catch {
		return null;
	}
}

export async function createRefreshToken(userId: string, env: Env): Promise<string> {
	const secret = new TextEncoder().encode(env.JWT_SECRET);

	const refreshToken = await new SignJWT({ sub: userId, type: "refresh" })
		.setProtectedHeader({ alg: env.JWT_ALGORITHM as string })
		.setIssuedAt()
		.setExpirationTime("30d")
		.sign(secret);

	return refreshToken;
}

export async function verifyRefreshToken(token: string, env: Env): Promise<string | null> {
	try {
		const secret = new TextEncoder().encode(env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret, {
			algorithms: [env.JWT_ALGORITHM as string],
		});

		if (payload.type !== "refresh") {
			return null;
		}

		return payload.sub as string;
	} catch {
		return null;
	}
}

export async function generateToken(
	payload: { userId: string; email: string },
	secret: string,
	algorithm: string,
	expiresIn: string,
): Promise<string> {
	const secretKey = new TextEncoder().encode(secret);

	const jwt = await new SignJWT({ sub: payload.userId, email: payload.email })
		.setProtectedHeader({ alg: algorithm })
		.setIssuedAt()
		.setExpirationTime(expiresIn)
		.sign(secretKey);

	return jwt;
}
