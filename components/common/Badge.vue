<template>
  <span :class="badgeClasses">
    <span v-if="$slots.icon || icon || dot" class="badge-icon">
      <span v-if="dot" class="badge-dot" />
      <slot v-else name="icon">
        <component :is="icon" v-if="icon" />
      </slot>
    </span>
    <slot />
    <button
      v-if="closable"
      type="button"
      @click="$emit('close')"
      class="badge-close"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
	variant?: "primary" | "success" | "warning" | "danger" | "info" | "gray";
	size?: "xs" | "sm" | "md" | "lg";
	rounded?: "md" | "lg" | "full";
	closable?: boolean;
	icon?: string;
	dot?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "gray",
	size: "sm",
	rounded: "full",
	closable: false,
	dot: false,
});

defineEmits<{
	close: [];
}>();

const _badgeClasses = computed(() => {
	const base = "badge inline-flex items-center font-medium transition-all duration-200";

	const variants = {
		primary: "badge-primary",
		success: "badge-success",
		warning: "badge-warning",
		danger: "badge-danger",
		info: "badge-info",
		gray: "badge-gray",
	};

	const sizes = {
		xs: "text-xs px-2 py-0.5",
		sm: "text-xs px-2.5 py-0.5",
		md: "text-sm px-3 py-1",
		lg: "text-base px-4 py-1.5",
	};

	const roundedStyles = {
		md: "rounded-md",
		lg: "rounded-lg",
		full: "rounded-full",
	};

	return [base, variants[props.variant], sizes[props.size], roundedStyles[props.rounded]].join(" ");
});
</script>

<style scoped>
.badge-icon {
  @apply -ml-0.5 mr-1.5 flex items-center;
}

.badge-dot {
  @apply w-2 h-2 rounded-full bg-current;
}

.badge-close {
  @apply -mr-0.5 ml-1.5 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors;
}

.badge .badge-icon svg {
  @apply w-3.5 h-3.5;
}

.badge.text-xs .badge-icon svg {
  @apply w-3 h-3;
}

.badge.text-base .badge-icon svg {
  @apply w-4 h-4;
}
</style>