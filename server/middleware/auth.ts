export default defineNuxtRouteMiddleware((to) => {
	const { isAuthenticated } = storeToRefs(useAuthStore());

	if (!isAuthenticated.value) {
		// Save the attempted route for redirect after login
		const redirectPath = to.fullPath;
		return navigateTo(`/login?redirect=${encodeURIComponent(redirectPath)}`);
	}
});
