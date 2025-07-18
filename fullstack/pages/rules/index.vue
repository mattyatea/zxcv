<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="md:flex md:items-center md:justify-between">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
          Coding Rules
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <NuxtLink
          to="/rules/new"
          class="btn btn-primary"
        >
          New Rule
        </NuxtLink>
      </div>
    </div>

    <!-- Search and filters -->
    <div class="mt-8 space-y-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search rules..."
            class="input"
            @input="debouncedSearch"
          />
        </div>
        <select
          v-model="filters.visibility"
          class="input sm:w-48"
          @change="fetchRules"
        >
          <option value="all">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="team">Team</option>
        </select>
        <select
          v-model="filters.sort"
          class="input sm:w-48"
          @change="fetchRules"
        >
          <option value="updated">Recently Updated</option>
          <option value="created">Recently Created</option>
          <option value="name">Name</option>
        </select>
      </div>

      <!-- Tags filter -->
      <div v-if="popularTags.length > 0" class="flex flex-wrap gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">Popular tags:</span>
        <button
          v-for="tag in popularTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            'px-3 py-1 rounded-full text-sm',
            selectedTags.includes(tag)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="mt-8 flex justify-center">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Rules list -->
    <div v-else-if="rules.length > 0" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="rule in rules"
        :key="rule.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo(`/rules/${rule.id}`)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white truncate">
              {{ rule.name }}
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              by {{ rule.author.username }}
            </p>
          </div>
          <span
            :class="[
              'ml-2 px-2 py-1 text-xs rounded-full',
              rule.visibility === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              rule.visibility === 'private' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            ]"
          >
            {{ rule.visibility }}
          </span>
        </div>
        
        <p v-if="rule.description" class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {{ rule.description }}
        </p>
        
        <div v-if="rule.tags && rule.tags.length > 0" class="mt-3 flex flex-wrap gap-1">
          <span
            v-for="tag in rule.tags"
            :key="tag"
            class="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded"
          >
            {{ tag }}
          </span>
        </div>
        
        <div class="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>v{{ rule.version }}</span>
          <span>{{ formatDate(rule.updated_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="mt-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rules found</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Get started by creating a new rule.
      </p>
      <div class="mt-6">
        <NuxtLink
          to="/rules/new"
          class="btn btn-primary"
        >
          New Rule
        </NuxtLink>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="[
            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
            page === currentPage
              ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          {{ page }}
        </button>
        
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

useHead({
  title: 'Rules - ZXCV'
})

const searchQuery = ref('')
const filters = ref({
  visibility: 'all',
  sort: 'updated'
})
const selectedTags = ref([])
const popularTags = ref(['eslint', 'prettier', 'typescript', 'react', 'vue'])

const rules = ref([])
const loading = ref(false)
const currentPage = ref(1)
const limit = 12
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / limit))
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const { $rpc } = useNuxtApp()

const fetchRules = async () => {
  loading.value = true
  
  try {
    const response = await $rpc.rules.search({
      limit,
      offset: (currentPage.value - 1) * limit,
      sort: filters.value.sort,
      visibility: filters.value.visibility,
      q: searchQuery.value || undefined,
      tags: selectedTags.value.length > 0 ? selectedTags.value.join(',') : undefined
    })
    
    rules.value = response.results
    total.value = response.total
  } catch (error) {
    console.error('Failed to fetch rules:', error)
  } finally {
    loading.value = false
  }
}

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  fetchRules()
}

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString()
}

let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchRules()
  }, 300)
}

watch(currentPage, fetchRules)

onMounted(() => {
  fetchRules()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>