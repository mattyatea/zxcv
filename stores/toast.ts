import { defineStore } from "pinia";

export interface Toast {
	id: string;
	message: string;
	type: "success" | "error" | "warning" | "info";
	duration?: number;
}

interface ToastState {
	toasts: Toast[];
}

export const useToastStore = defineStore("toast", () => {
	// State
	const toasts = ref<Toast[]>([]);

	// Actions
	const showToast = (options: Omit<Toast, "id">) => {
		const toast: Toast = {
			id: Date.now().toString(),
			duration: 3000,
			...options,
		};

		toasts.value.push(toast);

		// Auto-remove after duration
		if (toast.duration && toast.duration > 0) {
			setTimeout(() => {
				removeToast(toast.id);
			}, toast.duration);
		}

		return toast.id;
	};

	const removeToast = (id: string) => {
		const index = toasts.value.findIndex((t) => t.id === id);
		if (index > -1) {
			toasts.value.splice(index, 1);
		}
	};

	const clearAllToasts = () => {
		toasts.value = [];
	};

	// Helper methods for different types
	const success = (message: string, duration?: number) => {
		return showToast({ message, type: "success", duration });
	};

	const error = (message: string, duration?: number) => {
		return showToast({ message, type: "error", duration });
	};

	const warning = (message: string, duration?: number) => {
		return showToast({ message, type: "warning", duration });
	};

	const info = (message: string, duration?: number) => {
		return showToast({ message, type: "info", duration });
	};

	return {
		// State
		toasts: readonly(toasts),
		// Actions
		showToast,
		removeToast,
		clearAllToasts,
		// Helper methods
		success,
		error,
		warning,
		info,
	};
});
