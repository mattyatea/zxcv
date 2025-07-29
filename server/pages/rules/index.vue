<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="container-lg py-8">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between mb-8">
        <div class="stagger-item stagger-1">
          <h1 class="heading-1 mb-2">{{ $t('rules.title') }}</h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('rules.subtitle') }}
          </p>
        </div>
        <NuxtLink to="/rules/new" class="stagger-item stagger-2">
          <CommonButton variant="primary" class="hover-lift">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ $t('rules.createRule') }}
          </CommonButton>
        </NuxtLink>
      </div>

      <!-- 検索とフィルター -->
      <div class="space-y-6 mb-8 stagger-item stagger-3">
        <!-- 検索状態の表示 -->
        <div v-if="hasActiveFilters" class="flex items-center gap-2 text-sm">
          <span class="text-gray-600 dark:text-gray-400">フィルター:</span>
          <div class="flex flex-wrap gap-2">
            <span v-if="searchQuery" class="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              "{{ searchQuery }}"
              <button @click="searchQuery = ''; fetchRules()" class="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span v-if="filters.visibility !== 'all'" class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              {{ $t(`rules.visibility.${filters.visibility}`) }}
              <button @click="filters.visibility = 'all'; fetchRules()" class="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <button @click="resetFilters" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              すべてクリア
            </button>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div class="flex-1 relative group">
            <CommonInput
              v-model="searchQuery"
              :placeholder="$t('rules.searchPlaceholder')"
              @input="debouncedSearch"
              @keydown.enter="fetchRules"
              @keydown.esc="searchQuery = ''; fetchRules()"
              class="transition-all duration-300 focus-within:scale-[1.02] focus-within:shadow-lg"
            >
              <template #prefix>
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
              <template #suffix v-if="searchQuery">
                <button @click="searchQuery = ''; fetchRules()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </template>
            </CommonInput>
            <div class="absolute top-full mt-1 text-xs text-gray-500 dark:text-gray-400">
              <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Enter</kbd> で検索、
              <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd> でクリア
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <CommonSelect
              v-model="filters.visibility"
              @change="fetchRules"
              class="sm:min-w-[200px] transition-all duration-200 hover:shadow-md focus:scale-[1.02]"
            >
              <option value="all">{{ $t('rules.visibility.all') }}</option>
              <option value="public">{{ $t('rules.visibility.public') }}</option>
              <option value="private">{{ $t('rules.visibility.private') }}</option>
              <option value="organization">{{ $t('rules.visibility.organization') }}</option>
            </CommonSelect>
            <CommonSelect
              v-model="filters.sort"
              @change="fetchRules"
              class="sm:min-w-[200px] transition-all duration-200 hover:shadow-md focus:scale-[1.02]"
            >
              <option value="updated">{{ $t('rules.sort.recentlyUpdated') }}</option>
              <option value="created">{{ $t('rules.sort.recentlyCreated') }}</option>
              <option value="name">{{ $t('rules.sort.alphabetical') }}</option>
              <option value="downloads">ダウンロード数順</option>
              <option value="stars">スター数順</option>
            </CommonSelect>
          </div>
        </div>

        <!-- タグフィルター -->
        <div class="space-y-3">
          <div v-if="popularTags.length > 0" class="flex flex-wrap items-center gap-2 stagger-item stagger-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('rules.popularTags') }}</span>
            <button
              v-for="tag in popularTags"
              :key="tag"
              @click="toggleTag(tag)"
              :class="[
                'px-3 py-1 rounded-full text-sm transition-all duration-200 transform',
                selectedTags.includes(tag)
                  ? 'bg-primary-500 text-white hover:bg-primary-600 scale-105 shadow-md'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105'
              ]"
            >
              {{ tag }}
              <span v-if="selectedTags.includes(tag)" class="ml-1">×</span>
            </button>
          </div>
          <div v-if="selectedTags.length > 0" class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">選択中のタグ ({{ selectedTags.length }}):</span>
            <button @click="selectedTags = []; fetchRules()" class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              すべて解除
            </button>
          </div>
        </div>
      </div>

      <!-- ローディング -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="card">
          <div class="skeleton h-6 w-3/4 mb-3"></div>
          <div class="skeleton h-4 w-1/2 mb-4"></div>
          <div class="skeleton h-4 w-full mb-2"></div>
          <div class="skeleton h-4 w-2/3"></div>
        </div>
      </div>

      <!-- 検索結果のサマリー -->
      <div v-if="!loading && total > 0" class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span v-if="searchQuery || selectedTags.length > 0">
          {{ total }}件の検索結果
        </span>
        <span v-else>
          全{{ total }}件のルール
        </span>
      </div>

      <!-- ルール一覧 -->
      <div v-else-if="rules.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-item stagger-5">
        <NuxtLink
          v-for="(rule, index) in rules"
          :key="rule.id"
          :to="getRuleUrl(rule)"
          class="card-hover group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-2xl stagger-item relative"
          :class="`stagger-${Math.min(index + 6, 8)}`"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ rule.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                by {{ rule.organization ? '@' + rule.organization.name : rule.author.username }}
              </p>
            </div>
            <span
              :class="[
                'ml-2 px-2 py-1 text-xs rounded-full',
                rule.visibility === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                rule.visibility === 'private' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              ]"
            >
              {{ $t(`rules.visibility.${rule.visibility}`) }}
            </span>
          </div>
          
          <p v-if="rule.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {{ rule.description }}
          </p>
          
          <div v-if="rule.tags && rule.tags.length > 0" class="flex flex-wrap gap-1 mb-4">
            <span
              v-for="tag in rule.tags"
              :key="tag"
              class="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded"
            >
              {{ tag }}
            </span>
          </div>
          
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-3">
              <span>v{{ rule.version }}</span>
              <div v-if="rule.downloads !== undefined" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>{{ rule.downloads }}</span>
              </div>
              <div v-if="rule.stars !== undefined" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span>{{ rule.stars }}</span>
              </div>
            </div>
            <span>{{ formatDate(rule.updated_at) }}</span>
          </div>
        </NuxtLink>
      </div>

      <!-- 空の状態 -->
      <div v-else class="text-center py-12">
        <div v-if="hasActiveFilters" class="max-w-md mx-auto">
          <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            検索結果がありません
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            「{{ searchQuery }}」{{ selectedTags.length > 0 ? 'と選択されたタグ' : '' }}に一致するルールが見つかりませんでした。
          </p>
          <CommonButton variant="ghost" @click="resetFilters">
            フィルターをクリア
          </CommonButton>
        </div>
        <div v-else>
          <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {{ $t('rules.noRulesFound') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ $t('rules.createFirstRule') }}
          </p>
          <NuxtLink to="/rules/new">
            <CommonButton variant="primary">
              {{ $t('rules.createRule') }}
            </CommonButton>
          </NuxtLink>
        </div>
      </div>

      <!-- ページネーション -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <nav class="flex items-center space-x-1">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
          >
            {{ page }}
          </button>
          
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

interface Author {
	id: string;
	username: string;
}

interface Organization {
	id: string;
	name: string;
	displayName: string;
}

interface Rule {
	id: string;
	name: string;
	description?: string;
	visibility: "public" | "private" | "organization";
	author: Author;
	organization?: Organization;
	tags: string[];
	version: string;
	updated_at: number;
	downloads?: number;
	stars?: number;
}

const { t } = useI18n();

useHead({
	title: t("rules.pageTitle"),
});

const searchQuery = ref("");
const filters = ref({
	visibility: "all",
	sort: "updated",
});
const selectedTags = ref<string[]>([]);
const popularTags = ref([
	"eslint",
	"prettier",
	"typescript",
	"react",
	"vue",
	"nuxt",
	"tailwind",
	"nextjs",
	"nodejs",
	"python",
	"go",
	"rust",
]);

// フィルターがアクティブかどうか
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const hasActiveFilters = computed(() => {
	return (
		searchQuery.value !== "" || filters.value.visibility !== "all" || selectedTags.value.length > 0
	);
});

const rules = ref<Rule[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const limit = 12;
const total = ref(0);

const totalPages = computed(() => Math.ceil(total.value / limit));
const visiblePages = computed(() => {
	const pages: number[] = [];
	const start = Math.max(1, currentPage.value - 2);
	const end = Math.min(totalPages.value, start + 4);

	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	return pages;
});

const { $rpc } = useNuxtApp();

const fetchRules = async () => {
	loading.value = true;

	try {
		const response = await $rpc.rules.search({
			limit,
			page: currentPage.value,
			sortBy: filters.value.sort,
			visibility: filters.value.visibility === "all" ? undefined : filters.value.visibility,
			query: searchQuery.value || undefined,
			tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
		});

		// Ensure each rule has all required properties
		rules.value = response.rules.map((rule) => ({
			...rule,
			tags: rule.tags || [],
			description: rule.description || "",
		}));
		total.value = response.total;
	} catch (error) {
		console.error("Failed to fetch rules:", error);
	} finally {
		loading.value = false;
	}
};

const toggleTag = (tag: string) => {
	const index = selectedTags.value.indexOf(tag);
	if (index > -1) {
		selectedTags.value.splice(index, 1);
	} else {
		selectedTags.value.push(tag);
	}
	currentPage.value = 1;
	fetchRules();
};

const { locale } = useI18n();

const formatDate = (timestamp: number) => {
	return new Date(timestamp * 1000).toLocaleDateString(locale.value === "ja" ? "ja-JP" : "en-US");
};

const getRuleUrl = (rule: Rule) => {
	if (rule.organization) {
		return `/rules/@${rule.organization.name}/${rule.name}`;
	}
	// User rules
	return `/rules/@${rule.author.username}/${rule.name}`;
};

let searchTimeout: NodeJS.Timeout;
const debouncedSearch = () => {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		currentPage.value = 1;
		fetchRules();
	}, 300);
};

watch(currentPage, fetchRules);

// フィルターをリセット
const resetFilters = () => {
	searchQuery.value = "";
	filters.value = {
		visibility: "all",
		sort: "updated",
	};
	selectedTags.value = [];
	currentPage.value = 1;
	fetchRules();
};

onMounted(() => {
	fetchRules();

	// キーボードショートカット
	document.addEventListener("keydown", (e) => {
		// Cmd/Ctrl + K で検索にフォーカス
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
			searchInput?.focus();
		}
	});
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>