import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToastStore } from "~/stores/toast";

describe("Toast Store", () => {
	beforeEach(() => {
		// Create a fresh pinia instance for each test
		setActivePinia(createPinia());
		// Mock timers
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("showToast", () => {
		it("adds a toast with unique ID", () => {
			const store = useToastStore();

			const id = store.showToast({
				message: "Test toast",
				type: "success",
			});

			expect(store.toasts).toHaveLength(1);
			expect(store.toasts[0]).toEqual({
				id,
				message: "Test toast",
				type: "success",
				duration: 3000,
			});
			expect(id).toBeTruthy();
		});

		it("uses default duration of 3000ms", () => {
			const store = useToastStore();

			store.showToast({
				message: "Test",
				type: "info",
			});

			expect(store.toasts[0].duration).toBe(3000);
		});

		it("allows custom duration", () => {
			const store = useToastStore();

			store.showToast({
				message: "Test",
				type: "info",
				duration: 5000,
			});

			expect(store.toasts[0].duration).toBe(5000);
		});

		it("auto-removes toast after duration", () => {
			const store = useToastStore();

			store.showToast({
				message: "Test",
				type: "info",
				duration: 1000,
			});

			expect(store.toasts).toHaveLength(1);

			// Fast forward time
			vi.advanceTimersByTime(1000);

			expect(store.toasts).toHaveLength(0);
		});

		it("does not auto-remove if duration is 0", () => {
			const store = useToastStore();

			store.showToast({
				message: "Persistent toast",
				type: "info",
				duration: 0,
			});

			expect(store.toasts).toHaveLength(1);

			// Fast forward time
			vi.advanceTimersByTime(10000);

			// Toast should still be there
			expect(store.toasts).toHaveLength(1);
		});

		it("generates unique IDs for multiple toasts", () => {
			const store = useToastStore();

			const id1 = store.showToast({ message: "Toast 1", type: "info" });
			const id2 = store.showToast({ message: "Toast 2", type: "info" });
			const id3 = store.showToast({ message: "Toast 3", type: "info" });

			expect(id1).not.toBe(id2);
			expect(id2).not.toBe(id3);
			expect(id1).not.toBe(id3);
			expect(store.toasts).toHaveLength(3);
		});
	});

	describe("removeToast", () => {
		it("removes toast by ID", () => {
			const store = useToastStore();

			const id1 = store.showToast({ message: "Toast 1", type: "info" });
			const id2 = store.showToast({ message: "Toast 2", type: "info" });
			const id3 = store.showToast({ message: "Toast 3", type: "info" });

			expect(store.toasts).toHaveLength(3);

			store.removeToast(id2);

			expect(store.toasts).toHaveLength(2);
			expect(store.toasts.find((t) => t.id === id2)).toBeUndefined();
			expect(store.toasts.find((t) => t.id === id1)).toBeDefined();
			expect(store.toasts.find((t) => t.id === id3)).toBeDefined();
		});

		it("does nothing if ID not found", () => {
			const store = useToastStore();

			store.showToast({ message: "Toast", type: "info" });
			expect(store.toasts).toHaveLength(1);

			store.removeToast("non-existent-id");
			expect(store.toasts).toHaveLength(1);
		});
	});

	describe("clearAllToasts", () => {
		it("removes all toasts", () => {
			const store = useToastStore();

			store.showToast({ message: "Toast 1", type: "info" });
			store.showToast({ message: "Toast 2", type: "error" });
			store.showToast({ message: "Toast 3", type: "success" });

			expect(store.toasts).toHaveLength(3);

			store.clearAllToasts();

			expect(store.toasts).toHaveLength(0);
		});

		it("works when no toasts exist", () => {
			const store = useToastStore();

			expect(store.toasts).toHaveLength(0);
			store.clearAllToasts();
			expect(store.toasts).toHaveLength(0);
		});
	});

	describe("helper methods", () => {
		it("success method creates success toast", () => {
			const store = useToastStore();

			const id = store.success("Success message", 5000);

			expect(store.toasts).toHaveLength(1);
			expect(store.toasts[0]).toEqual({
				id,
				message: "Success message",
				type: "success",
				duration: 5000,
			});
		});

		it("error method creates error toast", () => {
			const store = useToastStore();

			const id = store.error("Error message");

			expect(store.toasts).toHaveLength(1);
			expect(store.toasts[0]).toEqual({
				id,
				message: "Error message",
				type: "error",
				duration: 3000,
			});
		});

		it("warning method creates warning toast", () => {
			const store = useToastStore();

			const id = store.warning("Warning message", 2000);

			expect(store.toasts).toHaveLength(1);
			expect(store.toasts[0]).toEqual({
				id,
				message: "Warning message",
				type: "warning",
				duration: 2000,
			});
		});

		it("info method creates info toast", () => {
			const store = useToastStore();

			const id = store.info("Info message");

			expect(store.toasts).toHaveLength(1);
			expect(store.toasts[0]).toEqual({
				id,
				message: "Info message",
				type: "info",
				duration: 3000,
			});
		});
	});

	describe("reactivity", () => {
		it("toasts array is readonly", () => {
			const store = useToastStore();
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			// TypeScript should prevent direct modification
			// @ts-expect-error - Testing readonly property
			store.toasts.push({ id: "1", message: "Test", type: "info" });

			// Vue 3 readonly objects warn instead of throwing
			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});

		it("maintains order of toasts", () => {
			const store = useToastStore();

			store.success("First");
			store.error("Second");
			store.warning("Third");
			store.info("Fourth");

			expect(store.toasts[0].message).toBe("First");
			expect(store.toasts[1].message).toBe("Second");
			expect(store.toasts[2].message).toBe("Third");
			expect(store.toasts[3].message).toBe("Fourth");
		});
	});

	describe("concurrent operations", () => {
		it("handles multiple auto-remove timers correctly", () => {
			const store = useToastStore();

			store.showToast({ message: "Toast 1", type: "info", duration: 1000 });
			store.showToast({ message: "Toast 2", type: "info", duration: 2000 });
			store.showToast({ message: "Toast 3", type: "info", duration: 3000 });

			expect(store.toasts).toHaveLength(3);

			// After 1 second, first toast should be removed
			vi.advanceTimersByTime(1000);
			expect(store.toasts).toHaveLength(2);
			expect(store.toasts.find((t) => t.message === "Toast 1")).toBeUndefined();

			// After another second, second toast should be removed
			vi.advanceTimersByTime(1000);
			expect(store.toasts).toHaveLength(1);
			expect(store.toasts.find((t) => t.message === "Toast 2")).toBeUndefined();

			// After another second, third toast should be removed
			vi.advanceTimersByTime(1000);
			expect(store.toasts).toHaveLength(0);
		});

		it("can manually remove toast that has auto-remove timer", () => {
			const store = useToastStore();

			const id = store.showToast({ message: "Test", type: "info", duration: 5000 });

			// Remove manually before timer
			store.removeToast(id);
			expect(store.toasts).toHaveLength(0);

			// Timer should not cause issues
			vi.advanceTimersByTime(5000);
			expect(store.toasts).toHaveLength(0);
		});
	});
});
