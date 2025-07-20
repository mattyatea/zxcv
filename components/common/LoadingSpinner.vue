<template>
  <div :class="containerClasses">
    <svg
      :class="spinnerClasses"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span v-if="text" :class="textClasses">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	color?: "primary" | "white" | "gray" | "current";
	text?: string;
	fullscreen?: boolean;
	overlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	size: "md",
	color: "primary",
	fullscreen: false,
	overlay: false,
});

const _containerClasses = computed(() => {
	const base = "flex items-center justify-center";

	if (props.fullscreen) {
		return `${base} fixed inset-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm`;
	}

	if (props.overlay) {
		return `${base} absolute inset-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-[inherit]`;
	}

	return `${base} ${props.text ? "flex-col space-y-2" : ""}`;
});

const _spinnerClasses = computed(() => {
	const base = "spinner animate-spin";

	const sizes = {
		xs: "w-3 h-3",
		sm: "w-4 h-4",
		md: "w-6 h-6",
		lg: "w-8 h-8",
		xl: "w-12 h-12",
	};

	const colors = {
		primary: "text-primary-500",
		white: "text-white",
		gray: "text-gray-500",
		current: "text-current",
	};

	return [base, sizes[props.size], colors[props.color]].join(" ");
});

const _textClasses = computed(() => {
	const sizes = {
		xs: "text-xs",
		sm: "text-sm",
		md: "text-base",
		lg: "text-lg",
		xl: "text-xl",
	};

	return [sizes[props.size], "text-gray-600 dark:text-gray-400 font-medium"].join(" ");
});
</script>