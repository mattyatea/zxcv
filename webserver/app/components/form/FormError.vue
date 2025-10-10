<template>
  <p
    v-if="error"
    :class="[
      'mt-1 text-sm text-red-600 dark:text-red-400',
      className
    ]"
  >
    {{ error }}
  </p>
</template>

<script setup lang="ts">
interface Props {
  error?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  error: '',
  class: ''
});

const className = computed(() => props.class);
</script>