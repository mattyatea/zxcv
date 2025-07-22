<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
  >
    <!-- Ripple Effect -->
    <span
      v-if="showRipple"
      :style="rippleStyle"
      class="absolute rounded-full bg-white/30 dark:bg-white/20 pointer-events-none animate-ripple"
    />
    
    <!-- Loading Spinner -->
    <Transition name="spinner">
      <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </span>
    </Transition>
    
    <!-- Button Content -->
    <span :class="contentClasses">
      <slot name="icon-left" />
      <slot />
      <slot name="icon-right" />
    </span>
    
    <!-- Smooth Hover Glow Effect -->
    <span 
      v-if="glow"
      :style="glowStyle"
      class="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none"
    >
      <span 
        class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        :class="{
          'bg-gradient-radial from-primary-400/30 via-primary-400/10 to-transparent': variant === 'primary',
          'bg-gradient-radial from-gray-400/20 via-gray-400/5 to-transparent': variant === 'secondary',
          'bg-gradient-radial from-red-400/30 via-red-400/10 to-transparent': variant === 'danger',
          'bg-gradient-radial from-green-400/30 via-green-400/10 to-transparent': variant === 'success',
        }"
        :style="{
          background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), currentColor 0%, transparent 60%)`,
          opacity: isHovered ? 0.3 : 0,
        }"
      />
    </span>
  </component>
</template>

<script setup lang="ts">
import { type Component, computed, ref } from "vue";
import { useAnimation } from "~/composables/useAnimation";

interface Props {
	variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline" | "gradient";
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
	rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
	tag?: string | Component;
	icon?: boolean;
	shadow?: boolean;
	pulse?: boolean;
	glow?: boolean;
	ripple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "primary",
	size: "md",
	loading: false,
	disabled: false,
	fullWidth: false,
	rounded: "lg",
	tag: "button",
	icon: false,
	shadow: false,
	pulse: false,
	glow: false,
	ripple: true,
});

const { animate } = useAnimation();

// Ripple effect state
const showRipple = ref(false);
const rippleX = ref(0);
const rippleY = ref(0);

const rippleStyle = computed(() => ({
	left: `${rippleX.value}px`,
	top: `${rippleY.value}px`,
	transform: "translate(-50%, -50%)",
}));

// Handle click with ripple effect
const handleClick = (event: MouseEvent) => {
	if (!props.ripple || props.disabled || props.loading) {
		return;
	}

	const button = event.currentTarget as HTMLElement;
	const rect = button.getBoundingClientRect();

	rippleX.value = event.clientX - rect.left;
	rippleY.value = event.clientY - rect.top;
	showRipple.value = true;

	setTimeout(() => {
		showRipple.value = false;
	}, 600);
};

// Smooth hover state management
const isHovered = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);

// Track mouse position for gradient effect
const handleMouseMove = (event: MouseEvent) => {
	if (!props.glow) {
		return;
	}
	const button = event.currentTarget as HTMLElement;
	const rect = button.getBoundingClientRect();
	mouseX.value = ((event.clientX - rect.left) / rect.width) * 100;
	mouseY.value = ((event.clientY - rect.top) / rect.height) * 100;
};

const handleMouseEnter = (_event: MouseEvent) => {
	isHovered.value = true;
};

const handleMouseLeave = (_event: MouseEvent) => {
	isHovered.value = false;
};

const glowStyle = computed(() => {
	if (!props.glow || !isHovered.value) {
		return {};
	}
	return {
		"--mouse-x": `${mouseX.value}%`,
		"--mouse-y": `${mouseY.value}%`,
	};
});

const buttonClasses = computed(() => {
	const base =
		"relative inline-flex items-center justify-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu transition-all duration-300 ease-out";

	const variants = {
		primary:
			"bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm hover:shadow-lg",
		secondary:
			"bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500 shadow-sm hover:shadow-lg",
		ghost:
			"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 focus-visible:ring-gray-500",
		outline:
			"border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 focus-visible:ring-primary-500 hover:border-primary-600",
		danger:
			"bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-sm hover:shadow-lg",
		success:
			"bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500 shadow-sm hover:shadow-lg",
		gradient:
			"bg-gradient-to-r from-primary-500 to-accent-600 text-white hover:from-primary-600 hover:to-accent-700 focus-visible:ring-primary-500 shadow-sm hover:shadow-lg",
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
		xl: "rounded-xl",
		full: "rounded-full",
	};

	return [
		base,
		variants[props.variant],
		sizes[props.size],
		roundedStyles[props.rounded],
		props.fullWidth && "w-full",
		props.loading && "cursor-wait",
		props.icon && "aspect-square",
		props.shadow && "shadow-lg hover:shadow-2xl transition-shadow duration-300",
		props.pulse && "animate-pulse",
		"group overflow-hidden",
	]
		.filter(Boolean)
		.join(" ");
});

const contentClasses = computed(() => {
	return [
		"flex items-center gap-2 relative z-10",
		props.loading && "opacity-0",
		"transition-opacity duration-200",
	]
		.filter(Boolean)
		.join(" ");
});
</script>

<style scoped>
/* Base button hover animation */
.group {
  transition: 
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease !important;
  will-change: transform;
}

.group:hover:not(:disabled) {
  transform: translateY(-2px) !important;
}

.group:active:not(:disabled) {
  transition: transform 0.1s ease !important;
  transform: translateY(0) scale(0.98) !important;
}

/* Spinner transition */
.spinner-enter-active,
.spinner-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.spinner-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-90deg);
}

.spinner-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(90deg);
}

/* Smooth ripple animation */
@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.4;
  }
  100% {
    width: 500px;
    height: 500px;
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

/* Gradient animation for gradient variant */
button.bg-gradient-to-r {
  background-size: 200% 100%;
  background-position: 0% 0%;
  transition: 
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-position 0.3s ease;
}

button.bg-gradient-to-r:hover:not(:disabled) {
  background-position: 100% 0%;
}

/* Glow effect animation */
.group:hover .absolute > span {
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}
</style>