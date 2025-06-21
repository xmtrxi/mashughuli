export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  if (!authStore.user && !authStore.token) {
    return navigateTo(`/auth/login?redirect=${to.path}`);
  }
});
