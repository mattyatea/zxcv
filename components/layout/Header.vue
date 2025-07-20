<template>
  <header class="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
    <div class="container-lg">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and Navigation -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center group">
            <div class="flex items-center space-x-2">
              <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                <span class="text-white font-bold text-lg">Z</span>
              </div>
              <span class="text-2xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block">
                zxcv
              </span>
            </div>
          </NuxtLink>
          
          <nav class="hidden md:ml-8 md:flex md:items-center md:space-x-1">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
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
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Dark mode toggle -->
          <button
            @click="toggleDark"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <svg v-if="!isDark" class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          <!-- User menu -->
          <div v-if="user" class="flex items-center space-x-3">
            <NuxtLink to="/rules/new">
              <CommonButton
                size="sm"
                variant="primary"
                class="hover-lift"
              >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
                新規ルール
              </CommonButton>
            </NuxtLink>

            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium group-hover:scale-105 transition-transform">
                  {{ user.username[0].toUpperCase() }}
                </div>
                <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform" :class="showUserMenu ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p class="text-sm text-gray-600 dark:text-gray-400">サインイン中</p>
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
                      ログアウト
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
                ログイン
              </CommonButton>
            </NuxtLink>
            <NuxtLink to="/register">
              <CommonButton
                variant="primary"
                size="sm"
              >
                アカウント作成
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
    <CommonModal v-model="showSearch" title="検索" size="lg">
      <CommonInput
        v-model="searchQuery"
        placeholder="ルールを検索..."
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
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useThemeStore } from "~/stores/theme";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const showUserMenu = ref(false);
const _showMobileMenu = ref(false);
const showSearch = ref(false);
const searchQuery = ref("");
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

const _navigation = [
	{ name: "ルール", href: "/rules" },
	{ name: "チーム", href: "/teams" },
	{ name: "ドキュメント", href: "/docs" },
];

const _userMenuItems = computed(() => [
	{
		name: "プロフィール",
		href: authStore.user ? `/profile/${authStore.user.username}` : "/profile",
		icon: "svg", // TODO: Add proper icon component
	},
	{
		name: "設定",
		href: "/settings",
		icon: "svg",
	},
	{
		name: "APIキー",
		href: "/api-keys",
		icon: "svg",
	},
]);

const _toggleDark = () => {
	themeStore.toggleTheme();
};

const _handleLogout = async () => {
	showUserMenu.value = false;
	await authStore.logout();
};

const _handleSearch = () => {
	if (searchQuery.value) {
		showSearch.value = false;
		navigateTo(`/rules?q=${encodeURIComponent(searchQuery.value)}`);
		searchQuery.value = "";
	}
};

// Theme is now handled by the theme store and plugin
</script>