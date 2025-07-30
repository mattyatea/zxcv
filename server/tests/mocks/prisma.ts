import { vi } from "vitest";

// Mock PrismaClient for test environment
export const PrismaClient = vi.fn().mockImplementation(() => ({
	$connect: vi.fn(),
	$disconnect: vi.fn(),
	$transaction: vi.fn(),
	user: {
		create: vi.fn(),
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		count: vi.fn(),
	},
	rule: {
		create: vi.fn(),
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		count: vi.fn(),
	},
	organization: {
		create: vi.fn(),
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		count: vi.fn(),
	},
	// Add other models as needed
}));

export const PrismaD1 = vi.fn();

// Mock Prisma namespace and error classes
export const Prisma = {
	PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
		// biome-ignore lint/suspicious/noExplicitAny: Prisma error metadata can have various structures
		constructor(message: string, { code, clientVersion, meta }: any) {
			super(message);
			this.code = code;
			this.clientVersion = clientVersion;
			this.meta = meta;
			this.name = "PrismaClientKnownRequestError";
		}
		code: string;
		clientVersion: string;
		// biome-ignore lint/suspicious/noExplicitAny: Prisma error metadata can have various structures
		meta?: any;
	},
	PrismaClientValidationError: class PrismaClientValidationError extends Error {
		constructor(message: string) {
			super(message);
			this.name = "PrismaClientValidationError";
		}
	},
	PrismaClientInitializationError: class PrismaClientInitializationError extends Error {
		constructor(message: string, clientVersion: string, errorCode?: string) {
			super(message);
			this.name = "PrismaClientInitializationError";
			this.clientVersion = clientVersion;
			this.errorCode = errorCode;
		}
		clientVersion: string;
		errorCode?: string;
	},
};
