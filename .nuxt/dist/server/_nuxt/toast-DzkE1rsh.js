import { defineStore } from "pinia";
import { ref, readonly } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
const useToastStore = defineStore("toast", () => {
  const toasts = ref([]);
  let idCounter = 0;
  const showToast = (options) => {
    const toast = {
      id: `toast_${Date.now()}_${++idCounter}`,
      duration: 3e3,
      ...options
    };
    toasts.value.push(toast);
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    }
    return toast.id;
  };
  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };
  const clearAllToasts = () => {
    toasts.value = [];
  };
  const success = (message, duration) => {
    return showToast({ message, type: "success", ...duration !== void 0 && { duration } });
  };
  const error = (message, duration) => {
    return showToast({ message, type: "error", ...duration !== void 0 && { duration } });
  };
  const warning = (message, duration) => {
    return showToast({ message, type: "warning", ...duration !== void 0 && { duration } });
  };
  const info = (message, duration) => {
    return showToast({ message, type: "info", ...duration !== void 0 && { duration } });
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
    info
  };
});
export {
  useToastStore as u
};
//# sourceMappingURL=toast-DzkE1rsh.js.map
