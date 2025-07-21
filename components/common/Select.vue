<template>
  <div class="relative">
    <select
      :id="id"
      v-model="modelValue"
      :disabled="disabled"
      :required="required"
      :class="selectClasses"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Option {
	value: string;
	label: string;
}

interface Props {
	modelValue: string;
	options: Option[];
	placeholder?: string;
	error?: string;
	disabled?: boolean;
	required?: boolean;
	size?: "sm" | "md" | "lg";
}

interface Emits {
	(e: "update:modelValue", value: string): void;
	(e: "blur"): void;
	(e: "focus"): void;
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	required: false,
	size: "md",
});

defineEmits<Emits>();

// Generate unique ID for accessibility
const id = `select-${Math.random().toString(36).substr(2, 9)}`;

const selectClasses = computed(() => {
	const base =
		"w-full bg-white dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors appearance-none pr-10";

	const sizes = {
		sm: "text-sm px-3 py-1.5",
		md: "text-sm px-4 py-2",
		lg: "text-base px-4 py-3",
	};

	const states = {
		normal: "border-gray-200 dark:border-gray-800",
		error: "border-danger focus:border-danger focus:ring-danger",
		disabled: "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-950",
	};

	return [
		base,
		sizes[props.size],
		props.error ? states.error : states.normal,
		props.disabled && states.disabled,
	]
		.filter(Boolean)
		.join(" ");
});
</script>