// Vue component testing requires a separate config file
// since Cloudflare Workers pool doesn't support DOM environments

// Helper to create mock Nuxt app context
export function createMockNuxtApp() {
	return {
		$config: {
			public: {
				apiUrl: "http://localhost:3000",
			},
		},
		$router: {
			push: vi.fn(),
			replace: vi.fn(),
			back: vi.fn(),
			go: vi.fn(),
			currentRoute: {
				value: {
					path: "/",
					query: {},
					params: {},
				},
			},
		},
		$route: {
			path: "/",
			query: {},
			params: {},
		},
	};
}

// Helper to create mock Pinia store
export function createMockStore(storeName: string, initialState: Record<string, any> = {}) {
	return {
		[storeName]: {
			...initialState,
			$patch: vi.fn(),
			$reset: vi.fn(),
			$subscribe: vi.fn(),
		},
	};
}

// Helper to wait for async updates
export async function flushPromises() {
	await new Promise((resolve) => setImmediate(resolve));
}

// Helper for testing async components
export async function waitForAsync(callback: () => void | Promise<void>, timeout = 1000) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		try {
			await callback();
			return;
		} catch (error) {
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	}
	throw new Error("Timeout waiting for async operation");
}