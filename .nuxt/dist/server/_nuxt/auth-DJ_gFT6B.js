import { defineStore } from "pinia";
import { ref, computed, readonly } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { a as useNuxtApp, n as navigateTo } from "../server.mjs";
const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const accessToken = ref(null);
  const refreshToken = ref(null);
  const isLoading = ref(false);
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
  const initializeAuth = () => {
  };
  const login = async (credentials) => {
    isLoading.value = true;
    try {
      const nuxtApp = useNuxtApp();
      const $rpc = nuxtApp.$rpc;
      const response = await $rpc.auth.login({
        email: credentials.email,
        password: credentials.password
      });
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      user.value = response.user;
      if (false) ;
      return response;
    } catch (error) {
      await logout();
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  const register = async (data) => {
    isLoading.value = true;
    try {
      const nuxtApp = useNuxtApp();
      const $rpc = nuxtApp.$rpc;
      const response = await $rpc.auth.register(data);
      await login({
        email: data.email,
        password: data.password
      });
      return response;
    } finally {
      isLoading.value = false;
    }
  };
  const logout = async () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    await navigateTo("/login");
  };
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error("No refresh token available");
    }
    try {
      const nuxtApp = useNuxtApp();
      const $rpc = nuxtApp.$rpc;
      const response = await $rpc.auth.refresh({
        refreshToken: refreshToken.value
      });
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      if (false) ;
      return response;
    } catch (error) {
      await logout();
      throw error;
    }
  };
  const fetchCurrentUser = async () => {
    if (!accessToken.value) {
      return null;
    }
    try {
      const nuxtApp = useNuxtApp();
      const $rpc = nuxtApp.$rpc;
      const response = await $rpc.users.settings();
      user.value = {
        id: response.id,
        email: response.email,
        username: response.username,
        emailVerified: response.email_verified
      };
      if (false) ;
      return response;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return null;
    }
  };
  const updateUser = (updatedUser) => {
    if (!user.value) {
      return;
    }
    user.value = {
      ...user.value,
      ...updatedUser
    };
  };
  const setAuthData = async (data) => {
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    user.value = data.user;
  };
  return {
    // State
    user: readonly(user),
    accessToken: readonly(accessToken),
    refreshToken: readonly(refreshToken),
    isLoading: readonly(isLoading),
    // Getters
    isAuthenticated,
    // Actions
    login,
    register,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    updateUser,
    setAuthData,
    initializeAuth
  };
});
export {
  useAuthStore as u
};
//# sourceMappingURL=auth-DJ_gFT6B.js.map
