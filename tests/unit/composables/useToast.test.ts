import { describe, expect, it, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useToast } from "~/composables/useToast";
import { useToastStore } from "~/stores/toast";

describe("useToast composable", () => {
	beforeEach(() => {
		// Create a fresh pinia instance for each test
		setActivePinia(createPinia());
	});

	it("exposes toast store methods", () => {
		const toast = useToast();

		expect(toast).toHaveProperty("showToast");
		expect(toast).toHaveProperty("success");
		expect(toast).toHaveProperty("error");
		expect(toast).toHaveProperty("warning");
		expect(toast).toHaveProperty("info");
		expect(toast).toHaveProperty("removeToast");
		expect(toast).toHaveProperty("clearAllToasts");

		// All methods should be functions
		expect(typeof toast.showToast).toBe("function");
		expect(typeof toast.success).toBe("function");
		expect(typeof toast.error).toBe("function");
		expect(typeof toast.warning).toBe("function");
		expect(typeof toast.info).toBe("function");
		expect(typeof toast.removeToast).toBe("function");
		expect(typeof toast.clearAllToasts).toBe("function");
	});

	it("methods are linked to store methods", () => {
		const toast = useToast();
		const store = useToastStore();

		// Methods should be the same references
		expect(toast.showToast).toBe(store.showToast);
		expect(toast.success).toBe(store.success);
		expect(toast.error).toBe(store.error);
		expect(toast.warning).toBe(store.warning);
		expect(toast.info).toBe(store.info);
		expect(toast.removeToast).toBe(store.removeToast);
		expect(toast.clearAllToasts).toBe(store.clearAllToasts);
	});

	it("can show toast through composable", () => {
		const toast = useToast();
		const store = useToastStore();

		const id = toast.showToast({
			message: "Test message",
			type: "success",
		});

		expect(store.toasts).toHaveLength(1);
		expect(store.toasts[0]).toEqual({
			id,
			message: "Test message",
			type: "success",
			duration: 3000,
		});
	});

	it("can use helper methods", () => {
		const toast = useToast();
		const store = useToastStore();

		toast.success("Success message");
		toast.error("Error message");
		toast.warning("Warning message");
		toast.info("Info message");

		expect(store.toasts).toHaveLength(4);
		expect(store.toasts[0].type).toBe("success");
		expect(store.toasts[1].type).toBe("error");
		expect(store.toasts[2].type).toBe("warning");
		expect(store.toasts[3].type).toBe("info");
	});

	it("can remove toast", () => {
		const toast = useToast();
		const store = useToastStore();

		const id = toast.success("Test");
		expect(store.toasts).toHaveLength(1);

		toast.removeToast(id);
		expect(store.toasts).toHaveLength(0);
	});

	it("can clear all toasts", () => {
		const toast = useToast();
		const store = useToastStore();

		toast.success("Message 1");
		toast.error("Message 2");
		toast.info("Message 3");

		expect(store.toasts).toHaveLength(3);

		toast.clearAllToasts();
		expect(store.toasts).toHaveLength(0);
	});

	it("maintains reactivity", () => {
		const toast1 = useToast();
		const toast2 = useToast();
		const store = useToastStore();

		// Add toast through first composable instance
		toast1.success("Test message");

		// Should be visible through store and second composable
		expect(store.toasts).toHaveLength(1);

		// Clear through second composable instance
		toast2.clearAllToasts();

		// Should be cleared everywhere
		expect(store.toasts).toHaveLength(0);
	});
});