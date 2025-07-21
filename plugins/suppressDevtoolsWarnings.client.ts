export default defineNuxtPlugin(() => {
	// Suppress Vue DevTools $id warnings in development
	if (import.meta.dev) {
		const originalWarn = console.warn;
		console.warn = (...args) => {
			const message = args[0];
			// Filter out Vue DevTools $id warnings
			if (
				typeof message === "string" &&
				message.includes('Property "$id" was accessed during render')
			) {
				return;
			}
			originalWarn.apply(console, args);
		};
	}
});
