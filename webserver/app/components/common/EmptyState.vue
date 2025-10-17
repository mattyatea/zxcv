<template>
  <div class="text-center py-12">
    <div v-if="icon" class="mx-auto mb-4">
      <component :is="icon" class="w-12 h-12 text-gray-400" />
    </div>
    
    <svg
      v-else
      class="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      />
    </svg>
    
    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
      {{ title }}
    </h3>
    
    <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ description }}
    </p>
    
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

interface Props {
	icon?: Component;
	title: string;
	description?: string;
}

defineProps<Props>();
</script>