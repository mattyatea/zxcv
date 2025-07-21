<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <span :class="{ 'opacity-0': loading, 'flex items-center gap-2': true }">
      <slot name="icon-left" />
      <slot />
      <slot name="icon-right" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { type Component, computed } from "vue";

interface Props {
	variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
	rounded?: "none" | "sm" | "md" | "lg" | "full";
	tag?: string | Component;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "primary",
	size: "md",
	loading: false,
	disabled: false,
	fullWidth: false,
	rounded: "lg",
	tag: "button",
});

const buttonClasses = computed(() => {
	const base =
		"relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

	const variants = {
		primary:
			"bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm hover:shadow-md",
		secondary:
			"bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500",
		ghost:
			"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500",
		danger:
			"bg-danger text-white hover:bg-red-600 focus-visible:ring-danger shadow-sm hover:shadow-md",
		success:
			"bg-success text-white hover:bg-green-600 focus-visible:ring-success shadow-sm hover:shadow-md",
	};

	const sizes = {
		xs: "text-xs px-2.5 py-1.5",
		sm: "text-sm px-3 py-1.5",
		md: "text-sm px-4 py-2",
		lg: "text-base px-6 py-3",
		xl: "text-lg px-8 py-4",
	};

	const roundedStyles = {
		none: "rounded-none",
		sm: "rounded",
		md: "rounded-md",
		lg: "rounded-lg",
		full: "rounded-full",
	};

	return [
		base,
		variants[props.variant],
		sizes[props.size],
		roundedStyles[props.rounded],
		props.fullWidth && "w-full",
		props.loading && "cursor-wait",
	]
		.filter(Boolean)
		.join(" ");
});
</script>