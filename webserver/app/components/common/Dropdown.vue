<template>
  <div class="relative" ref="dropdownRef">
    <div @click="toggle">
      <slot name="trigger" :isOpen="isOpen" />
    </div>
    
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute mt-2 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50',
          positionClasses,
          widthClasses
        ]"
      >
        <div class="py-1" role="menu" aria-orientation="vertical">
          <slot :close="close" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

interface Props {
	position?: "left" | "right";
	width?: "auto" | "full" | string;
	closeOnClick?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	position: "right",
	width: "auto",
	closeOnClick: true,
});

const emit = defineEmits<{
	open: [];
	close: [];
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement>();

const positionClasses = computed(() => {
	return props.position === "left" ? "left-0" : "right-0";
});

const widthClasses = computed(() => {
	if (props.width === "full") {
		return "w-full";
	}
	if (props.width === "auto") {
		return "w-48";
	}
	return props.width;
});

const toggle = () => {
	isOpen.value ? close() : open();
};

const open = () => {
	isOpen.value = true;
	emit("open");
};

const close = () => {
	isOpen.value = false;
	emit("close");
};

const handleClickOutside = (event: MouseEvent) => {
	if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
		close();
	}
};

onMounted(() => {
	document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
	document.removeEventListener("click", handleClickOutside);
});

defineExpose({
	close,
	open,
	toggle,
	isOpen,
});
</script>