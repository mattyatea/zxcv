<template>
  <header class="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800 animate-slideInDown">
    <div class="container-lg">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and Navigation -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center group">
            <div class="flex items-center space-x-2">
              <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 transform">
                <span class="text-white font-bold text-lg">Z</span>
              </div>
              <span class="text-2xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block transition-all duration-300 group-hover:translate-x-1">
                zxcv
              </span>
            </div>
          </NuxtLink>
          
          <nav class="hidden md:ml-8 md:flex md:items-center md:space-x-1">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 ease-out relative overflow-hidden group"
              active-class="bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold"
            >
              {{ item.name }}
            </NuxtLink>
          </nav>
        </div>

        <!-- Right side buttons -->
        <div class="flex items-center space-x-2">
          <!-- Search button -->
          <button
            @click="showSearch = true"
            class="nav-button p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 ease-out relative overflow-hidden group"
          >
            <svg class="w-5 h-5 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Dark mode toggle -->
          <button
            @click="toggleDark"
            class="nav-button p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 ease-out relative overflow-hidden group"
          >
            <Transition
              enter-active-class="transition-all duration-500 ease-out"
              enter-from-class="opacity-0 rotate-180 scale-50"
              enter-to-class="opacity-100 rotate-0 scale-100"
              leave-active-class="transition-all duration-500 ease-out"
              leave-from-class="opacity-100 rotate-0 scale-100"
              leave-to-class="opacity-0 rotate-180 scale-50"
            >
              <svg v-if="!isDark" key="moon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else key="sun" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </Transition>
          </button>

          <!-- Language Switcher -->
          <CommonLanguageSwitcher />

          <!-- User menu -->
          <div v-if="user" class="flex items-center space-x-2">
            <!-- Quick access dropdown -->
            <div class="relative hidden md:block">
              <button
                @click="showQuickAccess = !showQuickAccess"
                class="nav-button flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 ease-out relative overflow-hidden group"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>{{ t('nav.myRules') }}</span>
                <svg class="w-3 h-3 transition-transform duration-300 ease-out" :class="showQuickAccess ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="transform opacity-0 scale-95 -translate-y-4"
                enter-to-class="transform opacity-100 scale-100 translate-y-0"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="transform opacity-100 scale-100 translate-y-0"
                leave-to-class="transform opacity-0 scale-95 -translate-y-4"
              >
                <div
                  v-if="showQuickAccess"
                  @click.away="showQuickAccess = false"
                  class="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 z-50"
                >
                  <div class="p-3">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ t('nav.quickAccess') }}</h3>
                    <div class="space-y-1">
                      <NuxtLink
                        :to="`/rules?author=${user.username}`"
                        @click="showQuickAccess = false"
                        class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {{ t('rules.myRules') }}
                      </NuxtLink>
                      <NuxtLink
                        to="/organizations"
                        @click="showQuickAccess = false"
                        class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-accent-50 dark:hover:bg-accent-950/20 hover:text-accent-600 dark:hover:text-accent-400 rounded-lg transition-colors"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {{ t('nav.myOrganizations') }}
                      </NuxtLink>
                    </div>
                  </div>
                  
                  <div class="p-3">
                    <NuxtLink to="/rules/new" @click="showQuickAccess = false">
                      <CommonButton
                        size="sm"
                        variant="primary"
                        class="w-full justify-center hover-lift"
                      >
                        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        {{ t('rules.createRule') }}
                      </CommonButton>
                    </NuxtLink>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Mobile create button -->
            <NuxtLink to="/rules/new" class="md:hidden">
              <CommonButton
                size="sm"
                variant="primary"
                class="hover-lift"
                icon
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </CommonButton>
            </NuxtLink>

            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all duration-200 group active:scale-95"
              >
                <Avatar
                  :src="user.avatarUrl"
                  :name="user.displayName || user.username"
                  :alt="`${user.username}'s avatar`"
                  size="sm"
                  shape="circle"
                  :use-gradient="true"
                  class="shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-200"
                />
                <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200" :class="showUserMenu ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="showUserMenu"
                  @click.away="showUserMenu = false"
                  class="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 animate-in"
                >
                  <div class="px-4 py-3">
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('auth.login.loggingIn') }}</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ user.email }}</p>
                  </div>
                  
                  <div class="py-1">
                    <NuxtLink
                      v-for="item in userMenuItems"
                      :key="item.name"
                      :to="item.href"
                      @click="showUserMenu = false"
                      class="flex items-center px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <component :is="item.icon" class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
                      {{ item.name }}
                    </NuxtLink>
                  </div>
                  
                  <div class="py-1">
                    <button
                      @click="handleLogout"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <svg class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {{ t('nav.logout') }}
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Login/Signup buttons -->
          <div v-else class="flex items-center space-x-2">
            <NuxtLink to="/login">
              <CommonButton
                variant="ghost"
                size="sm"
              >
                {{ t('nav.login') }}
              </CommonButton>
            </NuxtLink>
            <NuxtLink to="/register">
              <CommonButton
                variant="primary"
                size="sm"
              >
                {{ t('nav.register') }}
              </CommonButton>
            </NuxtLink>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <nav class="px-4 py-2 space-y-1">
          <NuxtLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            @click="showMobileMenu = false"
            class="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            active-class="bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold"
          >
            {{ item.name }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>

    <!-- Search Modal -->
    <CommonModal v-model="showSearch" :title="t('common.search')" size="lg">
      <CommonInput
        v-model="searchQuery"
        :placeholder="t('rules.searchPlaceholder')"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </template>
      </CommonInput>
    </CommonModal>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useThemeStore } from "~/stores/theme";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const showUserMenu = ref(false);
const showMobileMenu = ref(false);
const showSearch = ref(false);
const showQuickAccess = ref(false);
const searchQuery = ref("");
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

const { t } = useI18n();

const navigation = computed(() => {
	const items = [
		{ name: t("nav.home"), href: "/" },
		{ name: t("nav.rules"), href: "/rules" },
		{ name: t("nav.install"), href: "/install" },
	];

	// Only show organizations navigation if user is authenticated
	if (user.value) {
		items.push({ name: t("nav.organizations"), href: "/organizations" });
	}

	return items;
});

const userMenuItems = computed(() => [
	{
		name: t("nav.profile"),
		href: authStore.user ? `/user/${authStore.user.username}` : "/user",
		icon: "svg", // TODO: Add proper icon component
	},
	{
		name: t("nav.settings"),
		href: "/settings",
		icon: "svg",
	},
	{
		name: t("settings.apiKeys"),
		href: "/api-keys",
		icon: "svg",
	},
]);

const toggleDark = () => {
	themeStore.toggleTheme();
};

const handleLogout = async () => {
	showUserMenu.value = false;
	await authStore.logout();
};

const handleSearch = () => {
	if (searchQuery.value) {
		showSearch.value = false;
		navigateTo(`/rules?q=${encodeURIComponent(searchQuery.value)}`);
		searchQuery.value = "";
	}
};

// Theme is now handled by the theme store and plugin
</script>