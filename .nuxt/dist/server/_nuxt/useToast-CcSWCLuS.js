import { u as useToastStore } from "./toast-DzkE1rsh.js";
const useToast = () => {
  const toastStore = useToastStore();
  return {
    showToast: toastStore.showToast,
    success: toastStore.success,
    error: toastStore.error,
    warning: toastStore.warning,
    info: toastStore.info,
    removeToast: toastStore.removeToast,
    clearAllToasts: toastStore.clearAllToasts
  };
};
export {
  useToast as u
};
//# sourceMappingURL=useToast-CcSWCLuS.js.map
