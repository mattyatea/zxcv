<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="container-lg py-12">
      <!-- ヘッダー -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
        <div class="stagger-item stagger-1">
          <h1 class="heading-1 mb-2 flex items-center gap-2">
            <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ $t('rules.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            {{ $t('rules.subtitle') }}
            <span v-if="total > 0" class="ml-2 text-sm font-medium">
              {{ $t('rules.itemsCount', { count: total.toLocaleString() }) }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-4 stagger-item stagger-2">
          <!-- ビュー切り替え -->
          <div class="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-l-lg transition-colors',
                viewMode === 'grid' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
              :aria-label="$t('rules.gridView')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-r-lg transition-colors',
                viewMode === 'list' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
              :aria-label="$t('rules.listView')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <NuxtLink to="/rules/new">
            <CommonButton variant="primary" class="hover-lift">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('rules.createRule') }}
            </CommonButton>
          </NuxtLink>
        </div>
      </div>

      <!-- 検索とフィルター -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-10 stagger-item stagger-3">
        <!-- クイック検索 -->
        <div class="mb-8">
          <div class="relative group">
            <CommonInput
              v-model="searchQuery"
              :placeholder="$t('rules.searchPlaceholder')"
              @input="debouncedSearch"
              @keydown.enter="fetchRules"
              @keydown.esc="searchQuery = ''; fetchRules()"
              class="h-12 text-lg transition-all duration-300 focus-within:scale-[1.01] focus-within:shadow-lg"
            >
              <template #prefix>
                <svg class="w-6 h-6 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
              <template #suffix v-if="searchQuery">
                <button @click="searchQuery = ''; fetchRules()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </template>
            </CommonInput>
            <div class="absolute -bottom-5 left-0 text-xs text-gray-500 dark:text-gray-400">
              <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">⌘K</kbd> {{ $t('rules.searchHint', { key: 'Ctrl+K' }) }}
            </div>
          </div>
        </div>

        <!-- 高度なフィルター -->
        <div class="space-y-4">
          <!-- フィルターオプション -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('rules.filters.visibility') }}
                </label>
                <div class="relative">
                  <select
                    v-model="filters.visibility"
                    @change="fetchRules"
                    class="w-full h-11 px-4 pr-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all">{{ $t('rules.visibility.all') }}</option>
                    <option value="public">{{ $t('rules.visibility.public') }}</option>
                    <option value="private">{{ $t('rules.visibility.private') }}</option>
                    <option value="organization">{{ $t('rules.visibility.organization') }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('rules.filters.sortBy') }}
                </label>
                <div class="relative">
                  <select
                    v-model="filters.sort"
                    @change="fetchRules"
                    class="w-full h-11 px-4 pr-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="updated">{{ $t('rules.sort.recentlyUpdated') }}</option>
                    <option value="created">{{ $t('rules.sort.recentlyCreated') }}</option>
                    <option value="name">{{ $t('rules.sort.alphabetical') }}</option>
                    <option value="views">{{ $t('rules.sort.views') }}</option>
                    <option value="stars">{{ $t('rules.sort.stars') }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('rules.filters.author') }}
                </label>
                <CommonInput
                  v-model="filters.author"
                  :placeholder="$t('rules.filters.authorPlaceholder')"
                  @input="debouncedSearch"
                  class="w-full"
                />
              </div>
            </div>

          <!-- タグフィルター -->
          <div v-if="popularTags.length > 0" class="space-y-4 mt-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('rules.filters.popularTags') }}</span>
              <button
                v-if="selectedTags.length > 0"
                @click="selectedTags = []; fetchRules()"
                class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {{ $t('rules.filters.clearTags') }} ({{ selectedTags.length }})
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in popularTags"
                :key="tag"
                @click="toggleTag(tag)"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 transform',
                  selectedTags.includes(tag)
                    ? 'bg-primary-500 text-white hover:bg-primary-600 scale-105 shadow-md'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                ]"
              >
                <span class="mr-1">#</span>{{ tag }}
                <span v-if="selectedTags.includes(tag)" class="ml-2">×</span>
              </button>
            </div>
          </div>
        </div>

        <!-- アクティブフィルター -->
        <div v-if="hasActiveFilters" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('rules.filters.activeFilters') }}
            </span>
            <button
              @click="resetFilters"
              class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {{ $t('rules.filters.resetAll') }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(filter, index) in activeFilters"
              :key="index"
              class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
            >
              <span class="font-medium">{{ filter.label }}:</span>
              {{ filter.value }}
              <button
                @click="removeFilter(filter.type)"
                class="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- ローディング -->
      <div v-if="loading" :class="viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'">
        <div v-for="i in 6" :key="i" :class="viewMode === 'grid' ? 'card' : 'card flex items-center gap-4'">
          <div v-if="viewMode === 'list'" class="skeleton w-16 h-16 rounded-lg shrink-0"></div>
          <div class="flex-1">
            <div class="skeleton h-6 w-3/4 mb-3"></div>
            <div class="skeleton h-4 w-1/2 mb-4"></div>
            <div class="skeleton h-4 w-full mb-2"></div>
            <div class="skeleton h-4 w-2/3"></div>
          </div>
        </div>
      </div>

      <!-- ルール一覧（グリッドビュー） -->
      <div v-if="!loading && rules.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-item stagger-5">
        <div
          v-for="(rule, index) in rules"
          :key="rule.id"
          class="group relative"
        >
          <NuxtLink
            :to="getRuleUrl(rule)"
            class="card-hover block h-full transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
          >
            <!-- スター済みバッジ -->
            <div v-if="rule.isStarred" class="absolute -top-2 -right-2 z-10">
              <span class="flex items-center justify-center w-8 h-8 bg-yellow-400 dark:bg-yellow-500 rounded-full shadow-lg">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            </div>

            <div class="flex items-start justify-between mb-4">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {{ rule.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ rule.organization ? '@' + rule.organization.name : rule.author.username }}
                </p>
              </div>
              <span
                :class="[
                  'ml-2 px-2 py-1 text-xs rounded-full shrink-0',
                  rule.visibility === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  rule.visibility === 'private' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                ]"
              >
                {{ $t(`rules.visibility.${rule.visibility}`) }}
              </span>
            </div>
            
            <p v-if="rule.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
              {{ rule.description }}
            </p>
            
            <div v-if="rule.tags && rule.tags.length > 0" class="flex flex-wrap gap-1 mb-4">
              <span
                v-for="tag in rule.tags.slice(0, 3)"
                :key="tag"
                class="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded"
              >
                #{{ tag }}
              </span>
              <span v-if="rule.tags.length > 3" class="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{{ rule.tags.length - 3 }}
              </span>
            </div>
            
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  v{{ rule.version }}
                </span>
                <div v-if="rule.views !== undefined" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>{{ formatNumber(rule.views) }}</span>
                </div>
                <div v-if="rule.stars !== undefined" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>{{ formatNumber(rule.stars) }}</span>
                </div>
              </div>
              <span class="text-xs">{{ formatDate(rule.updated_at) }}</span>
            </div>
          </NuxtLink>

          <!-- クイックアクション -->
          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div class="flex items-center gap-1">
              <button
                @click.prevent="toggleStar(rule)"
                :class="[
                  'p-1.5 rounded-lg transition-colors',
                  rule.isStarred 
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                ]"
                :aria-label="$t('rules.actions.star')"
              >
                <svg class="w-4 h-4" :fill="rule.isStarred ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ルール一覧（リストビュー） -->
      <div v-if="!loading && rules.length > 0 && viewMode === 'list'" class="space-y-6 stagger-item stagger-5">
        <div
          v-for="(rule, index) in rules"
          :key="rule.id"
          class="group relative"
        >
          <NuxtLink
            :to="getRuleUrl(rule)"
            class="card-hover flex items-center gap-6 p-8 transition-all duration-300 hover:scale-[1.005] hover:shadow-lg"
          >
            <!-- アイコン -->
            <div class="shrink-0 w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <!-- コンテンツ -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {{ rule.name }}
                    <span v-if="rule.isStarred" class="ml-2 text-yellow-500">★</span>
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    by {{ rule.organization ? '@' + rule.organization.name : rule.author.username }}
                  </p>
                </div>
                <span
                  :class="[
                    'ml-2 px-3 py-1 text-xs rounded-full shrink-0',
                    rule.visibility === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    rule.visibility === 'private' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  ]"
                >
                  {{ $t(`rules.visibility.${rule.visibility}`) }}
                </span>
              </div>

              <p v-if="rule.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
                {{ rule.description }}
              </p>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    v{{ rule.version }}
                  </span>
                  <div v-if="rule.views !== undefined" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span>{{ formatNumber(rule.views) }}</span>
                  </div>
                  <div v-if="rule.stars !== undefined" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>{{ formatNumber(rule.stars) }}</span>
                  </div>
                  <span class="text-xs">{{ formatDate(rule.updated_at) }}</span>
                </div>
                <div v-if="rule.tags && rule.tags.length > 0" class="flex items-center gap-1">
                  <span
                    v-for="tag in rule.tags.slice(0, 3)"
                    :key="tag"
                    class="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded"
                  >
                    #{{ tag }}
                  </span>
                  <span v-if="rule.tags.length > 3" class="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{{ rule.tags.length - 3 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- クイックアクション -->
            <div class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                @click.prevent="toggleStar(rule)"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  rule.isStarred 
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                ]"
                :aria-label="$t('rules.actions.star')"
              >
                <svg class="w-5 h-5" :fill="rule.isStarred ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-if="!loading && rules.length === 0" class="text-center py-24">
        <div v-if="hasActiveFilters" class="max-w-md mx-auto">
          <svg class="w-32 h-32 mx-auto text-gray-300 dark:text-gray-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            検索結果がありません
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            {{ $t('rules.noRulesMessage') }}
          </p>
          <CommonButton variant="ghost" size="lg" @click="resetFilters">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            フィルターをリセット
          </CommonButton>
        </div>
        <div v-else>
          <svg class="w-32 h-32 mx-auto text-gray-300 dark:text-gray-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {{ $t('rules.noRulesFound') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            {{ $t('rules.createFirstRule') }}
          </p>
          <NuxtLink to="/rules/new">
            <CommonButton variant="primary" size="lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('rules.createRule') }}
            </CommonButton>
          </NuxtLink>
        </div>
      </div>

      <!-- ページネーション -->
      <div v-if="totalPages > 1" class="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('rules.showing', { start: ((currentPage - 1) * limit + 1).toLocaleString(), end: Math.min(currentPage * limit, total).toLocaleString(), total: total.toLocaleString() }) }}
        </div>
        <nav class="flex items-center space-x-1">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="最初のページ"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="前のページ"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="flex items-center gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all duration-200',
                page === currentPage
                  ? 'bg-primary-500 text-white scale-110 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="次のページ"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="最後のページ"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";
import { useRpc } from "~/app/composables/useRpc";
import type { RuleType } from "~/app/types/orpc";


const { t } = useI18n();
const { user } = storeToRefs(useAuthStore());
const { success: toastSuccess, error: toastError } = useToast();

useHead({
	title: t("rules.pageTitle"),
});

// UI状態
const viewMode = ref<"grid" | "list">("grid");

// 検索・フィルター
const searchQuery = ref("");
const filters = ref({
	visibility: "all",
	sort: "updated",
	author: "",
});
const selectedTags = ref<string[]>([]);
const popularTags = ref([
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

// データ
const rules = ref<RuleType[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const limit = 12;
const total = ref(0);
const starredRuleIds = ref<Set<string>>(new Set());

// 計算プロパティ
const totalPages = computed(() => Math.ceil(total.value / limit));
const visiblePages = computed(() => {
	const pages: number[] = [];
	const maxVisible = 5;
	let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
	const end = Math.min(totalPages.value, start + maxVisible - 1);

	if (end - start + 1 < maxVisible) {
		start = Math.max(1, end - maxVisible + 1);
	}

	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	return pages;
});

const hasActiveFilters = computed(() => {
	return (
		searchQuery.value !== "" ||
		filters.value.visibility !== "all" ||
		filters.value.author !== "" ||
		selectedTags.value.length > 0
	);
});

const activeFilters = computed(() => {
	const filters_: Array<{ type: string; label: string; value: string }> = [];

	if (searchQuery.value) {
		filters_.push({ type: "search", label: "検索", value: searchQuery.value });
	}
	if (filters.value.visibility !== "all") {
		filters_.push({
			type: "visibility",
			label: t("rules.filters.visibility"),
			value: t(`rules.visibility.${filters.value.visibility}`),
		});
	}
	if (filters.value.author) {
		filters_.push({
			type: "author",
			label: t("rules.filters.author"),
			value: filters.value.author,
		});
	}
	if (selectedTags.value.length > 0) {
		filters_.push({ type: "tags", label: "タグ", value: selectedTags.value.join(", ") });
	}

	return filters_;
});

const $rpc = useRpc();

// ルール取得
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
			author: filters.value.author || undefined,
		});

		// スター状態を含めてルールを設定
		rules.value = response.rules.map((rule) => ({
			...rule,
			tags: rule.tags || [],
			description: rule.description || "",
			isStarred: starredRuleIds.value.has(rule.id),
		}));
		total.value = response.total;
	} catch (error) {
		console.error("Failed to fetch rules:", error);
		toastError(t("rules.messages.fetchError"));
	} finally {
		loading.value = false;
	}
};

// スター済みルールを取得
const fetchStarredRules = async () => {
	if (!user.value) {
		return;
	}

	// TODO: スター済みルールを取得するAPIを追加
	// try {
	// 	const starred = await $rpc.rules.getStarred();
	// 	starredRuleIds.value = new Set(starred.map(r => r.id));
	// } catch (error) {
	// 	console.error("Failed to fetch starred rules:", error);
	// }
};

// タグの切り替え
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

// スターの切り替え
const toggleStar = async (rule: RuleType) => {
	if (!user.value) {
		toastError(t("rules.detail.loginRequired"));
		return;
	}

	try {
		if (rule.isStarred) {
			await $rpc.rules.unstar({ ruleId: rule.id });
			starredRuleIds.value.delete(rule.id);
			rule.isStarred = false;
			if (rule.stars !== undefined) {
				rule.stars--;
			}
		} else {
			await $rpc.rules.star({ ruleId: rule.id });
			starredRuleIds.value.add(rule.id);
			rule.isStarred = true;
			if (rule.stars !== undefined) {
				rule.stars++;
			}
		}
	} catch (error) {
		console.error("Failed to toggle star:", error);
		toastError(rule.isStarred ? t("rules.detail.unstarError") : t("rules.detail.starError"));
	}
};

// フィルターをリセット
const resetFilters = () => {
	searchQuery.value = "";
	filters.value = {
		visibility: "all",
		sort: "updated",
		author: "",
	};
	selectedTags.value = [];
	currentPage.value = 1;
	fetchRules();
};

// 特定のフィルターを削除
const removeFilter = (type: string) => {
	switch (type) {
		case "search":
			searchQuery.value = "";
			break;
		case "visibility":
			filters.value.visibility = "all";
			break;
		case "author":
			filters.value.author = "";
			break;
		case "tags":
			selectedTags.value = [];
			break;
	}
	fetchRules();
};

// ユーティリティ
const { locale } = useI18n();

const formatDate = (timestamp: number) => {
	const date = new Date(timestamp * 1000);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return "今日";
	} else if (diffDays === 1) {
		return "昨日";
	} else if (diffDays < 7) {
		return `${diffDays}日前`;
	} else if (diffDays < 30) {
		return `${Math.floor(diffDays / 7)}週間前`;
	} else if (diffDays < 365) {
		return `${Math.floor(diffDays / 30)}ヶ月前`;
	} else {
		return date.toLocaleDateString(locale.value === "ja" ? "ja-JP" : "en-US");
	}
};

const formatNumber = (num: number) => {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`;
	} else if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toString();
};

const getRuleUrl = (rule: RuleType) => {
	if (rule.organization) {
		return `/rules/@${rule.organization.name}/${rule.name}`;
	}
	return `/rules/@${rule.author.username}/${rule.name}`;
};

// デバウンス検索
let searchTimeout: NodeJS.Timeout;
const debouncedSearch = () => {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		currentPage.value = 1;
		fetchRules();
	}, 300);
};

// ウォッチャー
watch(currentPage, fetchRules);
watch(viewMode, () => {
	// ビューモードをローカルストレージに保存
	localStorage.setItem("rules-view-mode", viewMode.value);
});

onMounted(() => {
	// ビューモードを復元
	const savedViewMode = localStorage.getItem("rules-view-mode");
	if (savedViewMode === "list" || savedViewMode === "grid") {
		viewMode.value = savedViewMode;
	}

	fetchRules();
	fetchStarredRules();

	// キーボードショートカット
	const handleKeyDown = (e: KeyboardEvent) => {
		// Cmd/Ctrl + K で検索にフォーカス
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
			searchInput?.focus();
		}
		// Escape でフィルターリセット
		if (e.key === "Escape" && hasActiveFilters.value) {
			e.preventDefault();
			resetFilters();
		}
		// G → G でグリッドビュー
		if (e.key === "g" && e.shiftKey === false) {
			setTimeout(() => {
				const handleSecondG = (e2: KeyboardEvent) => {
					if (e2.key === "g") {
						viewMode.value = "grid";
					}
					document.removeEventListener("keydown", handleSecondG);
				};
				document.addEventListener("keydown", handleSecondG);
				setTimeout(() => {
					document.removeEventListener("keydown", handleSecondG);
				}, 1000);
			}, 0);
		}
		// G → L でリストビュー
		if (e.key === "g" && e.shiftKey === false) {
			setTimeout(() => {
				const handleL = (e2: KeyboardEvent) => {
					if (e2.key === "l") {
						viewMode.value = "list";
					}
					document.removeEventListener("keydown", handleL);
				};
				document.addEventListener("keydown", handleL);
				setTimeout(() => {
					document.removeEventListener("keydown", handleL);
				}, 1000);
			}, 0);
		}
	};

	document.addEventListener("keydown", handleKeyDown);

	onBeforeUnmount(() => {
		document.removeEventListener("keydown", handleKeyDown);
	});
});
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

</style>