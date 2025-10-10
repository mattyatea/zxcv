<template>
  <component
    :is="as"
    :class="[
      'block w-full px-4 py-2 text-sm text-left transition-colors',
      disabled
        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
        : variant === 'danger'
        ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
      className
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <div class="flex items-center gap-2">
      <slot name="icon" />
      <slot />
    </div>
  </component>
</template>

<script setup lang="ts">
interface Props {
  as?: string | object;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'default',
  disabled: false,
  class: ''
});

const className = computed(() => props.class);
</script>