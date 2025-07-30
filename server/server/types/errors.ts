export class EmailServiceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "EmailServiceError";
	}
}

export class AuthenticationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthenticationError";
	}
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}

export class DatabaseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "DatabaseError";
	}
}

export class RateLimitError extends Error {
	constructor(
		message: string,
		public retryAfter?: number,
	) {
		super(message);
		this.name = "RateLimitError";
	}
}

export class OAuthError extends Error {
	constructor(
		message: string,
		public provider?: string,
	) {
		super(message);
		this.name = "OAuthError";
	}
}

export class TokenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TokenError";
	}
}
