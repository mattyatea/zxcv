<template>
	<Teleport to="body">
		<div class="fixed bottom-4 right-4 z-50 space-y-2">
			<TransitionGroup name="toast" tag="div">
				<div
					v-for="toast in _toasts"
					:key="toast.id"
					:class="[
						'min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 transition-all',
						_toastClasses[toast.type],
					]"
				>
					<Icon :name="_toastIcons[toast.type]" class="w-5 h-5 flex-shrink-0 mt-0.5" />
					<div class="flex-1">
						<p class="text-sm">{{ toast.message }}</p>
					</div>
					<button
						@click="_removeToast(toast.id)"
						class="text-current opacity-70 hover:opacity-100 transition-opacity"
					>
						<Icon name="mdi:close" class="w-4 h-4" />
					</button>
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from "~/stores/toast";

const toastStore = useToastStore();
const { toasts: _toasts } = storeToRefs(toastStore);
const { removeToast: _removeToast } = toastStore;

const _toastClasses = {
	success: "bg-green-600 text-white",
	error: "bg-red-600 text-white",
	warning: "bg-yellow-500 text-white",
	info: "bg-blue-600 text-white",
};

const _toastIcons = {
	success: "mdi:check-circle",
	error: "mdi:alert-circle",
	warning: "mdi:alert",
	info: "mdi:information",
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
	transition: all 0.3s ease;
}

.toast-enter-from {
	transform: translateX(100%);
	opacity: 0;
}

.toast-leave-to {
	transform: translateX(100%);
	opacity: 0;
}

.toast-move {
	transition: transform 0.3s ease;
}
</style>