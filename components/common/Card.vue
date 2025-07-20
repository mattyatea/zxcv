<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :class="cardClasses"
    v-bind="$attrs"
  >
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
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
	title?: string;
	variant?: "default" | "bordered" | "elevated" | "flat";
	padding?: "none" | "sm" | "md" | "lg" | "xl";
	rounded?: "none" | "sm" | "md" | "lg" | "xl";
	clickable?: boolean;
	hover?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "default",
	padding: "md",
	rounded: "xl",
	clickable: false,
	hover: false,
});

const _cardClasses = computed(() => {
	const base = "card block w-full transition-all duration-200";

	const variants = {
		default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm",
		bordered: "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800",
		elevated: "bg-white dark:bg-gray-900 shadow-lg",
		flat: "bg-gray-100 dark:bg-gray-800",
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
		? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
		: "";

	const hoverEffect =
		props.hover || props.clickable ? "hover:border-primary-500/20 hover:shadow-md hover-lift" : "";

	return [
		base,
		variants[props.variant],
		paddings[props.padding],
		roundedStyles[props.rounded],
		interactive,
		hoverEffect,
	]
		.filter(Boolean)
		.join(" ");
});

const _headerClasses = computed(() => {
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

const _footerClasses = computed(() => {
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
</style>