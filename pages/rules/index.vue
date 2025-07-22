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
        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div class="flex-1 relative group">
            <CommonInput
              v-model="searchQuery"
              :placeholder="$t('rules.searchPlaceholder')"
              @input="debouncedSearch"
              class="transition-all duration-300 focus-within:scale-[1.02] focus-within:shadow-lg"
            >
              <template #prefix>
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
            </CommonInput>
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
            </CommonSelect>
          </div>
        </div>

        <!-- タグフィルター -->
        <div v-if="popularTags.length > 0" class="flex flex-wrap items-center gap-2 stagger-item stagger-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('rules.popularTags') }}</span>
          <button
            v-for="tag in popularTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="[
              'px-3 py-1 rounded-full text-sm transition-colors',
              selectedTags.includes(tag)
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ tag }}
          </button>
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

      <!-- ルール一覧 -->
      <div v-else-if="rules.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-item stagger-5">
        <NuxtLink
          v-for="(rule, index) in rules"
          :key="rule.id"
          :to="getRuleUrl(rule)"
          class="card-hover group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-2xl stagger-item"
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
            <span>v{{ rule.version }}</span>
            <span>{{ formatDate(rule.updated_at) }}</span>
          </div>
        </NuxtLink>
      </div>

      <!-- 空の状態 -->
      <div v-else class="text-center py-12">
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
const popularTags = ref(["eslint", "prettier", "typescript", "react", "vue", "nuxt", "tailwind"]);

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

onMounted(() => {
	fetchRules();
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