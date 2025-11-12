// Setup environment variables for tests
process.env.NODE_ENV = "test";

// Mock console methods to reduce noise during tests
// Temporarily disabled to debug test issues
// global.console = {
// 	...console,
// 	log: vi.fn(),
// 	error: vi.fn(),
// 	warn: vi.fn(),
// 	info: vi.fn(),
// 	debug: vi.fn(),
// };

// Setup global test utilities
import { vi } from "vitest";

// Mock fetch for component tests
global.fetch = vi.fn();

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// Mock ResizeObserver for components that use it
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));
