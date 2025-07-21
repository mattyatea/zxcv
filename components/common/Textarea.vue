<template>
  <div>
    <label v-if="label" :for="id" class="label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="relative">
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :required="required"
        :class="textareaClasses"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="hint && !error" class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
	modelValue: string;
	label?: string;
	placeholder?: string;
	rows?: number;
	error?: string;
	hint?: string;
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
	rows: 4,
	disabled: false,
	required: false,
	size: "md",
});

defineEmits<Emits>();

// Generate unique ID for accessibility
const id = `textarea-${Math.random().toString(36).substr(2, 9)}`;

const textareaClasses = computed(() => {
	const base =
		"w-full bg-white dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-600 dark:placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-y";

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