export default defineNuxtRouteMiddleware((to) => {
  // Redirect old auth routes to new separate pages
  if (to.path === '/auth') {
    const tab = to.query.tab;
    if (tab === 'register') {
      return navigateTo('/register', { replace: true });
    }
    return navigateTo('/login', { replace: true });
  }
});