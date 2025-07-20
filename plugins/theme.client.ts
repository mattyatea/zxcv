export default defineNuxtPlugin(() => {
	const themeStore = useThemeStore();

	// Initialize theme on client-side
	themeStore.initializeTheme();
});
