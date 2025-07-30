<template>
  <component
    :is="clickable ? 'button' : 'div'"
    ref="cardRef"
    :class="cardClasses"
    v-bind="$attrs"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Hover Overlay Effect -->
    <div 
      v-if="hover || clickable" 
      class="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    />
    
    <!-- Content -->
    <div class="relative z-10">
      <div v-if="$slots.header || title" :class="headerClasses">
        <slot name="header">
          <h3 v-if="title" class="heading-4">
            {{ title }}
          </h3>
        </slot>
      </div>
      
      <div class="card-body">
        <slot />
      </div>
      
      <div v-if="$slots.footer" :class="footerClasses">
        <slot name="footer" />
      </div>
    </div>
    
    <!-- Loading Skeleton -->
    <div v-if="loading" class="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
      <div class="skeleton-loading w-full h-full" />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAnimation } from "~/composables/useAnimation";

interface Props {
	title?: string;
	variant?: "default" | "bordered" | "elevated" | "flat" | "glass";
	padding?: "none" | "sm" | "md" | "lg" | "xl";
	rounded?: "none" | "sm" | "md" | "lg" | "xl";
	clickable?: boolean;
	hover?: boolean;
	loading?: boolean;
	animationDelay?: number;
	animate?: boolean;
	animateOnScroll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "default",
	padding: "md",
	rounded: "xl",
	clickable: false,
	hover: false,
	loading: false,
	animationDelay: 0,
	animate: true,
	animateOnScroll: false,
});

const cardRef = ref<HTMLElement>();
const { animate, animateOnScroll } = useAnimation();

// Apply entrance animation
onMounted(() => {
	if (!props.animate) {
		return;
	}

	if (props.animateOnScroll && cardRef.value) {
		animateOnScroll(cardRef.value, "animate-scaleIn", {
			delay: props.animationDelay,
			once: true,
		});
	} else if (cardRef.value) {
		setTimeout(() => {
			animate(cardRef.value, "animate-scaleIn", {
				delay: props.animationDelay,
			});
		}, 50);
	}
});

// Handle hover animations
const handleMouseEnter = () => {
	if (!props.hover && !props.clickable) {
		return;
	}
	if (cardRef.value) {
		cardRef.value.style.transform = "translateY(-2px)";
	}
};

const handleMouseLeave = () => {
	if (!props.hover && !props.clickable) {
		return;
	}
	if (cardRef.value) {
		cardRef.value.style.transform = "translateY(0)";
	}
};

const cardClasses = computed(() => {
	const base = "card relative block w-full transition-all duration-300 group transform-gpu";

	const variants = {
		default:
			"bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md",
		bordered:
			"bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800",
		elevated: "bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl",
		flat: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750",
		glass:
			"bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl",
	};

	const paddings = {
		none: "p-0",
		sm: "p-4",
		md: "p-6",
		lg: "p-8",
		xl: "p-10",
	};

	const roundedStyles = {
		none: "rounded-none",
		sm: "rounded",
		md: "rounded-md",
		lg: "rounded-lg",
		xl: "rounded-xl",
	};

	const interactive = props.clickable
		? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 click-scale"
		: "";

	const hoverEffect = props.hover || props.clickable ? "hover-lift" : "";

	return [
		base,
		variants[props.variant],
		paddings[props.padding],
		roundedStyles[props.rounded],
		interactive,
		hoverEffect,
		props.loading && "animate-pulse",
	]
		.filter(Boolean)
		.join(" ");
});

const headerClasses = computed(() => {
	const paddingMap = {
		none: "",
		sm: "-m-4 mb-4 p-4",
		md: "-m-6 mb-6 p-6",
		lg: "-m-8 mb-8 p-8",
		xl: "-m-10 mb-10 p-10",
	};

	return [
		"card-header border-b border-gray-200 dark:border-gray-800",
		props.padding !== "none" && paddingMap[props.padding],
	]
		.filter(Boolean)
		.join(" ");
});

const footerClasses = computed(() => {
	const paddingMap = {
		none: "",
		sm: "-m-4 mt-4 p-4",
		md: "-m-6 mt-6 p-6",
		lg: "-m-8 mt-8 p-8",
		xl: "-m-10 mt-10 p-10",
	};

	return [
		"card-footer border-t border-gray-200 dark:border-gray-800",
		props.padding !== "none" && paddingMap[props.padding],
	]
		.filter(Boolean)
		.join(" ");
});
</script>

<style scoped>
.card-header:first-child {
  @apply rounded-t-[inherit];
}

.card-footer:last-child {
  @apply rounded-b-[inherit];
}

.card[class*="p-0"] .card-header,
.card[class*="p-0"] .card-footer {
  @apply m-0;
}

/* Smooth shadow transition */
.card {
  transition: box-shadow 0.2s ease-out, transform 0.2s ease-out;
}
</style>