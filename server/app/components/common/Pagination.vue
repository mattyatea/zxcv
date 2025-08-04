<template>
  <nav class="flex items-center justify-between" aria-label="Pagination">
    <div class="hidden sm:block">
      <p class="text-sm text-gray-700 dark:text-gray-400">
        {{ t('pagination.showing') }}
        <span class="font-medium">{{ startItem }}</span>
        {{ t('pagination.to') }}
        <span class="font-medium">{{ endItem }}</span>
        {{ t('pagination.of') }}
        <span class="font-medium">{{ totalItems }}</span>
        {{ t('pagination.results') }}
      </p>
    </div>
    
    <div class="flex-1 flex justify-between sm:justify-end">
      <button
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        :class="[
          'relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md',
          currentPage === 1
            ? 'border-gray-300 dark:border-gray-700 text-gray-300 dark:text-gray-700 bg-white dark:bg-gray-900 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
        ]"
      >
        {{ t('pagination.previous') }}
      </button>
      
      <div class="hidden md:flex mx-4 space-x-2">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
            page === currentPage
              ? 'z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
            page === '...' ? 'cursor-default hover:bg-white dark:hover:bg-gray-900' : ''
          ]"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
        :class="[
          'relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ml-3',
          currentPage === totalPages
            ? 'border-gray-300 dark:border-gray-700 text-gray-300 dark:text-gray-700 bg-white dark:bg-gray-900 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
        ]"
      >
        {{ t('pagination.next') }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:currentPage': [page: number];
}>();

const { t } = useI18n();

const startItem = computed(() => {
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
});

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const maxVisible = 7;
  
  if (props.totalPages <= maxVisible) {
    // Show all pages
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show first page
    pages.push(1);
    
    if (props.currentPage > 3) {
      pages.push('...');
    }
    
    // Show pages around current page
    const start = Math.max(2, props.currentPage - 1);
    const end = Math.min(props.totalPages - 1, props.currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (props.currentPage < props.totalPages - 2) {
      pages.push('...');
    }
    
    // Show last page
    pages.push(props.totalPages);
  }
  
  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page);
  }
};
</script>