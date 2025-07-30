import { vi } from "vitest";

// Export the mock directly
export const createPrismaClient = vi.fn(() => {
	// Return the global mock if available, otherwise create a new one
	if ((globalThis as any).__mockPrismaClient) {
		return (globalThis as any).__mockPrismaClient;
	}
	
	// This shouldn't happen if vitest.setup.mts runs first
	console.warn("Global mock Prisma client not found, creating temporary mock");
	return {};
});