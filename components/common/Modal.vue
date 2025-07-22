<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          <!-- Background overlay -->
          <div
            class="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm"
            @click="handleClose"
          />

          <!-- Modal panel -->
          <Transition name="modal-content">
            <div
              v-if="modelValue"
              :class="modalClasses"
              @click.stop
              @mousedown="handleMouseDown"
              @touchstart="handleTouchStart"
              :style="modalStyle"
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
                  class="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-all duration-200 hover:rotate-90"
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
import { computed, ref, watch } from "vue";

interface Props {
	modelValue: boolean;
	title?: string;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	showClose?: boolean;
	preventClose?: boolean;
	draggable?: boolean;
}

type Emits = (e: "update:modelValue", value: boolean) => void;

const props = withDefaults(defineProps<Props>(), {
	size: "md",
	showClose: true,
	preventClose: false,
	draggable: false,
});

const emit = defineEmits<Emits>();

// Modal dragging state
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// Reset position when modal opens
watch(
	() => props.modelValue,
	(isOpen) => {
		if (isOpen) {
			position.value = { x: 0, y: 0 };
		}
	},
);

const modalClasses = computed(() => {
	const base =
		"modal-panel relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 text-left shadow-2xl";

	const sizes = {
		sm: "sm:w-full sm:max-w-sm",
		md: "sm:w-full sm:max-w-lg",
		lg: "sm:w-full sm:max-w-2xl",
		xl: "sm:w-full sm:max-w-4xl",
		full: "sm:w-full sm:max-w-7xl",
	};

	return [
		base,
		sizes[props.size],
		props.draggable && "cursor-move select-none",
		isDragging.value && "transition-none",
	]
		.filter(Boolean)
		.join(" ");
});

const modalStyle = computed(() => ({
	transform: `translate(${position.value.x}px, ${position.value.y}px)`,
}));

const handleClose = () => {
	if (!props.preventClose) {
		emit("update:modelValue", false);
	}
};

// Dragging functionality
const handleMouseDown = (e: MouseEvent) => {
	if (!props.draggable) {
		return;
	}
	if ((e.target as HTMLElement).closest("button")) {
		return;
	}

	isDragging.value = true;
	dragStart.value = {
		x: e.clientX - position.value.x,
		y: e.clientY - position.value.y,
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging.value) {
			return;
		}
		position.value = {
			x: e.clientX - dragStart.value.x,
			y: e.clientY - dragStart.value.y,
		};
	};

	const handleMouseUp = () => {
		isDragging.value = false;
		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mouseup", handleMouseUp);
	};

	window.addEventListener("mousemove", handleMouseMove);
	window.addEventListener("mouseup", handleMouseUp);
};

const handleTouchStart = (e: TouchEvent) => {
	if (!props.draggable) {
		return;
	}
	const touch = e.touches[0];
	handleMouseDown(touch as unknown as MouseEvent);
};
</script>

<style scoped>
/* Modal backdrop transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-backdrop {
  transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Modal content transition */
.modal-content-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-leave-active {
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

/* Modal panel */
.modal-panel {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-panel:hover {
  box-shadow: 
    0 25px 30px -5px rgba(0, 0, 0, 0.15),
    0 15px 15px -5px rgba(0, 0, 0, 0.06);
}

/* Dragging state */
.cursor-move:active {
  cursor: grabbing;
}

/* Modal sections */
.modal-header {
  @apply flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700;
}

.modal-body {
  @apply px-6 py-4 max-h-[70vh] overflow-y-auto;
}

.modal-footer {
  @apply flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50;
}

/* Smooth scrollbar */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: theme('colors.gray.300');
  border-radius: 3px;
  transition: background 0.2s;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.400');
}

.dark .modal-body::-webkit-scrollbar-thumb {
  background: theme('colors.gray.700');
}

.dark .modal-body::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.600');
}
</style>