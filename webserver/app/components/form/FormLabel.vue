<template>
  <label
    :for="htmlFor"
    :class="[
      'block text-sm font-medium',
      required && 'after:content-[\"*\"] after:ml-0.5 after:text-red-500',
      error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
      className
    ]"
  >
    <slot />
  </label>
</template>

<script setup lang="ts">
interface Props {
  htmlFor?: string;
  required?: boolean;
  error?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  error: false,
  class: ''
});

const className = computed(() => props.class);
</script>