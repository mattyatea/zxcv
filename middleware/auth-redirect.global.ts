export default defineNuxtRouteMiddleware((to) => {
  // Redirect old auth routes to new unified auth page
  if (to.path === '/login') {
    return navigateTo('/auth?tab=login', { replace: true });
  }
  
  if (to.path === '/register') {
    return navigateTo('/auth?tab=register', { replace: true });
  }
});