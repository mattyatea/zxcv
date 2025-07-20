import { useToastStore } from "~/stores/toast";

export const useToast = () => {
	const toastStore = useToastStore();

	return {
		showToast: toastStore.showToast,
		success: toastStore.success,
		error: toastStore.error,
		warning: toastStore.warning,
		info: toastStore.info,
		removeToast: toastStore.removeToast,
		clearAllToasts: toastStore.clearAllToasts,
	};
};