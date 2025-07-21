<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          <!-- Background overlay -->
          <div
            class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
            @click="handleClose"
          />

          <!-- Modal panel -->
          <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="modelValue"
              :class="modalClasses"
              @click.stop
            >
              <!-- Header -->
              <div v-if="$slots.header || title" class="modal-header">
                <slot name="header">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ title }}
                  </h3>
                </slot>
                <button
                  v-if="showClose"
                  @click="handleClose"
                  class="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div class="modal-body">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="modal-footer">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
	modelValue: boolean;
	title?: string;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	showClose?: boolean;
	preventClose?: boolean;
}

type Emits = (e: "update:modelValue", value: boolean) => void;

const props = withDefaults(defineProps<Props>(), {
	size: "md",
	showClose: true,
	preventClose: false,
});

const emit = defineEmits<Emits>();

const modalClasses = computed(() => {
	const base =
		"relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all";

	const sizes = {
		sm: "sm:w-full sm:max-w-sm",
		md: "sm:w-full sm:max-w-lg",
		lg: "sm:w-full sm:max-w-2xl",
		xl: "sm:w-full sm:max-w-4xl",
		full: "sm:w-full sm:max-w-7xl",
	};

	return [base, sizes[props.size]].join(" ");
});

const handleClose = () => {
	if (!props.preventClose) {
		emit("update:modelValue", false);
	}
};
</script>

<style scoped>
.modal-header {
  @apply flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-footer {
  @apply flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900;
}
</style>