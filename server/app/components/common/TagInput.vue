<template>
  <div>
    <div class="space-y-2">
      <div v-if="modelValue.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="(tag, index) in modelValue"
          :key="tag"
          class="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full"
        >
          {{ tag }}
          <button
            type="button"
            @click="removeTag(index)"
            class="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      </div>
      
      <div class="relative">
        <input
          v-model="inputValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :class="inputClasses"
          @keydown.enter.prevent="addTag"
          @keydown.comma.prevent="addTag"
          @blur="addTag"
        />
      </div>
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="hint && !error" class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
	modelValue: string[];
	placeholder?: string;
	error?: string;
	hint?: string;
	disabled?: boolean;
	maxTags?: number;
}

type Emits = (e: "update:modelValue", value: string[]) => void;

const props = withDefaults(defineProps<Props>(), {
	placeholder: "タグを入力してEnterキーを押してください",
	disabled: false,
	maxTags: 10,
});

const emit = defineEmits<Emits>();

const inputValue = ref("");

const inputClasses = computed(() => {
	const base =
		"w-full px-4 py-2 bg-white dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-600 dark:placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors";

	const states = {
		normal: "border-gray-200 dark:border-gray-800",
		error: "border-danger focus:border-danger focus:ring-danger",
		disabled: "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-950",
	};

	return [base, props.error ? states.error : states.normal, props.disabled && states.disabled]
		.filter(Boolean)
		.join(" ");
});

const addTag = () => {
	const value = inputValue.value.trim();

	if (!value || props.modelValue.includes(value)) {
		inputValue.value = "";
		return;
	}

	if (props.maxTags && props.modelValue.length >= props.maxTags) {
		return;
	}

	emit("update:modelValue", [...props.modelValue, value]);
	inputValue.value = "";
};

const removeTag = (index: number) => {
	const newTags = [...props.modelValue];
	newTags.splice(index, 1);
	emit("update:modelValue", newTags);
};
</script>