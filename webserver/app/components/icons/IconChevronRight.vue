<template>
  <svg 
    :class="classes"
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M9 5l7 7-7 7"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  class: 'w-6 h-6'
});

const classes = computed(() => props.class);
</script>