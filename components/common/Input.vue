<template>
  <div class="form-group">
    <label v-if="label" :for="inputId" class="label">
      {{ label }}
      <span v-if="required" class="text-danger ml-1">*</span>
    </label>
    
    <div class="relative">
      <div v-if="$slots.prefix" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="prefix" />
      </div>
      
      <input
        :id="inputId"
        v-model="internalValue"
        :type="actualType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        v-bind="$attrs"
      />
      
      <div v-if="$slots.suffix || showPasswordToggle || clearable" class="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
        <button
          v-if="clearable && internalValue && !disabled && !readonly"
          type="button"
          @click="internalValue = ''"
          class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          v-if="showPasswordToggle"
          type="button"
          @click="togglePasswordVisibility"
          class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded"
        >
          <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
        <slot name="suffix" />
      </div>
    </div>
    
    <p v-if="hint && !error" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
      {{ hint }}
    </p>
    
    <p v-if="error" class="error-message">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, useSlots } from "vue";

interface Props {
	modelValue?: string | number;
	type?: string;
	label?: string;
	placeholder?: string;
	hint?: string;
	error?: string;
	disabled?: boolean;
	readonly?: boolean;
	required?: boolean;
	clearable?: boolean;
	variant?: "default" | "filled" | "outlined";
	size?: "sm" | "md" | "lg";
}

type Emits = (e: "update:modelValue", value: string | number) => void;

const props = withDefaults(defineProps<Props>(), {
	type: "text",
	variant: "default",
	size: "md",
	disabled: false,
	readonly: false,
	required: false,
	clearable: false,
});

const emit = defineEmits<Emits>();

const attrs = useAttrs();
const slots = useSlots();
const _inputId = computed(
	() => (attrs.id as string) || `input-${Math.random().toString(36).substring(2, 11)}`,
);
const showPassword = ref(false);

const _internalValue = computed({
	get: () => props.modelValue ?? "",
	set: (value) => emit("update:modelValue", value),
});

const _actualType = computed(() => {
	if (props.type === "password" && showPassword.value) {
		return "text";
	}
	return props.type;
});

const showPasswordToggle = computed(() => {
	return props.type === "password" && !props.disabled && !props.readonly;
});

const _inputClasses = computed(() => {
	const base =
		"input w-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

	const variants = {
		default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
		filled: "bg-gray-100 dark:bg-gray-800 border border-transparent",
		outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-800",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm rounded-md",
		md: "px-4 py-2 text-base rounded-lg",
		lg: "px-5 py-3 text-lg rounded-lg",
	};

	const states = {
		error: props.error ? "input-error" : "",
		disabled: props.disabled ? "opacity-50 cursor-not-allowed" : "",
		prefix: slots.prefix
			? props.size === "sm"
				? "pl-9"
				: props.size === "lg"
					? "pl-12"
					: "pl-10"
			: "",
		suffix:
			slots.suffix || props.clearable || showPasswordToggle.value
				? props.size === "sm"
					? "pr-9"
					: props.size === "lg"
						? "pr-12"
						: "pr-10"
				: "",
	};

	return [
		base,
		variants[props.variant],
		sizes[props.size],
		states.error,
		states.disabled,
		states.prefix,
		states.suffix,
	]
		.filter(Boolean)
		.join(" ");
});

const _togglePasswordVisibility = () => {
	showPassword.value = !showPassword.value;
};
</script>