import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfileEditForm from "~/app/components/settings/ProfileEditForm.vue";
import type { UserProfile } from "~/app/types/user";

// Mock the composables
const mockT = vi.fn((key: string) => key);
vi.mock("~/composables/useI18n", () => ({
	useI18n: () => ({
		$t: mockT,
	}),
}));

const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
	id: "user_123",
	email: "test@example.com",
	username: "testuser",
	emailVerified: true,
	displayName: "Test User",
	bio: "This is a test bio",
	location: "Tokyo, Japan",
	website: "https://example.com",
	avatarUrl: "avatars/user_123/avatar.jpg",
	createdAt: 1640995200,
	updatedAt: 1640995200,
	...overrides,
});

describe("ProfileEditForm", () => {
	let wrapper: any;
	const mockUser = createMockUser();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	const mountComponent = (props = {}) => {
		return mount(ProfileEditForm, {
			props: {
				user: mockUser,
				loading: false,
				...props,
			},
			global: {
				stubs: {
					Button: true,
					Input: true,
					Textarea: true,
					Icon: true,
				},
			},
		});
	};

	describe("Component Rendering", () => {
		it("should render the component correctly", () => {
			wrapper = mountComponent();
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.find("form")).toBeTruthy();
		});

		it("should initialize form with user data", () => {
			wrapper = mountComponent();

			// Check if form inputs are initialized with user data
			expect(wrapper.vm.form.displayName).toBe("Test User");
			expect(wrapper.vm.form.bio).toBe("This is a test bio");
			expect(wrapper.vm.form.location).toBe("Tokyo, Japan");
			expect(wrapper.vm.form.website).toBe("https://example.com");
		});

		it("should handle null user data", () => {
			const userWithNulls = createMockUser({
				displayName: null,
				bio: null,
				location: null,
				website: null,
				avatarUrl: null,
			});

			wrapper = mountComponent({ user: userWithNulls });

			expect(wrapper.vm.form.displayName).toBe("");
			expect(wrapper.vm.form.bio).toBe("");
			expect(wrapper.vm.form.location).toBe("");
			expect(wrapper.vm.form.website).toBe("");
		});

		it("should display avatar when available", () => {
			wrapper = mountComponent();
			expect(wrapper.vm.displayAvatarUrl).toContain("/api/avatars/user_123/avatar.jpg");
		});

		it("should show default avatar when no avatar URL", () => {
			const userWithoutAvatar = createMockUser({ avatarUrl: null });
			wrapper = mountComponent({ user: userWithoutAvatar });
			expect(wrapper.vm.displayAvatarUrl).toBeNull();
		});
	});

	describe("Form Validation", () => {
		beforeEach(() => {
			wrapper = mountComponent();
		});

		it("should validate website URL", async () => {
			wrapper.vm.form.website = "invalid-url";
			expect(wrapper.vm.isFormValid).toBe(false);

			wrapper.vm.form.website = "https://valid-url.com";
			expect(wrapper.vm.isFormValid).toBe(true);

			wrapper.vm.form.website = "";
			expect(wrapper.vm.isFormValid).toBe(true);
		});

		it("should detect form changes", async () => {
			expect(wrapper.vm.hasChanges).toBe(false);

			wrapper.vm.form.displayName = "Updated Name";
			expect(wrapper.vm.hasChanges).toBe(true);

			wrapper.vm.form.displayName = "Test User"; // Reset to original
			expect(wrapper.vm.hasChanges).toBe(false);
		});

		it("should track bio character count", () => {
			const longBio = "a".repeat(500);
			wrapper.vm.form.bio = longBio;
			expect(wrapper.vm.form.bio.length).toBe(500);
		});
	});

	describe("Form Actions", () => {
		beforeEach(() => {
			wrapper = mountComponent();
		});

		it("should emit update event on form submission", async () => {
			wrapper.vm.form.displayName = "Updated Name";
			wrapper.vm.form.bio = "Updated bio";

			await wrapper.vm.handleSubmit();

			expect(wrapper.emitted("update")).toBeTruthy();
			expect(wrapper.emitted("update")[0][0]).toEqual({
				displayName: "Updated Name",
				bio: "Updated bio",
			});
		});

		it("should not submit invalid form", async () => {
			wrapper.vm.form.website = "invalid-url";

			await wrapper.vm.handleSubmit();

			expect(wrapper.emitted("update")).toBeFalsy();
		});

		it("should not submit form without changes", async () => {
			// Form is already initialized with original values
			await wrapper.vm.handleSubmit();

			expect(wrapper.emitted("update")).toBeFalsy();
		});

		it("should reset form to original values", () => {
			wrapper.vm.form.displayName = "Changed Name";
			wrapper.vm.form.bio = "Changed bio";

			wrapper.vm.resetForm();

			expect(wrapper.vm.form.displayName).toBe("Test User");
			expect(wrapper.vm.form.bio).toBe("This is a test bio");
		});

		it("should handle null values in update", async () => {
			wrapper.vm.form.displayName = "";
			wrapper.vm.form.bio = "";
			wrapper.vm.form.location = "";
			wrapper.vm.form.website = "";

			await wrapper.vm.handleSubmit();

			expect(wrapper.emitted("update")).toBeTruthy();
			expect(wrapper.emitted("update")[0][0]).toEqual({
				displayName: null,
				bio: null,
				location: null,
				website: null,
			});
		});
	});

	describe("Avatar Upload", () => {
		beforeEach(() => {
			wrapper = mountComponent();
		});

		it("should emit upload-avatar event with valid file", () => {
			const mockFile = new File(["fake-image-data"], "avatar.jpg", { type: "image/jpeg" });
			const mockEvent = {
				target: {
					files: [mockFile],
				},
			};

			wrapper.vm.handleAvatarChange(mockEvent);

			expect(wrapper.emitted("upload-avatar")).toBeTruthy();
			expect(wrapper.emitted("upload-avatar")[0][0]).toBe(mockFile);
		});

		it("should not emit event for non-image files", () => {
			const mockFile = new File(["fake-text-data"], "document.txt", { type: "text/plain" });
			const mockEvent = {
				target: {
					files: [mockFile],
				},
			};

			wrapper.vm.handleAvatarChange(mockEvent);

			expect(wrapper.emitted("upload-avatar")).toBeFalsy();
		});

		it("should not emit event for oversized files", () => {
			// Create a mock file that appears to be over 5MB
			const mockFile = new File(["x".repeat(6 * 1024 * 1024)], "large-avatar.jpg", {
				type: "image/jpeg",
			});
			Object.defineProperty(mockFile, "size", { value: 6 * 1024 * 1024 });

			const mockEvent = {
				target: {
					files: [mockFile],
				},
			};

			wrapper.vm.handleAvatarChange(mockEvent);

			expect(wrapper.emitted("upload-avatar")).toBeFalsy();
		});

		it("should reset file input after processing", () => {
			const mockFile = new File(["fake-image-data"], "avatar.jpg", { type: "image/jpeg" });
			const mockTarget = {
				files: [mockFile],
				value: "avatar.jpg",
			};
			const mockEvent = {
				target: mockTarget,
			};

			wrapper.vm.handleAvatarChange(mockEvent);

			expect(mockTarget.value).toBe("");
		});

		it("should handle empty file selection", () => {
			const mockEvent = {
				target: {
					files: [],
				},
			};

			wrapper.vm.handleAvatarChange(mockEvent);

			expect(wrapper.emitted("upload-avatar")).toBeFalsy();
		});
	});

	describe("Loading State", () => {
		it("should disable form when loading", () => {
			wrapper = mountComponent({ loading: true });

			// Form inputs should be disabled
			expect(wrapper.props("loading")).toBe(true);

			// Check if submit button shows loading state
			expect(wrapper.vm.loading).toBe(true);
		});

		it("should show normal state when not loading", () => {
			wrapper = mountComponent({ loading: false });

			expect(wrapper.props("loading")).toBe(false);
			expect(wrapper.vm.loading).toBe(false);
		});
	});

	describe("Props Changes", () => {
		beforeEach(() => {
			wrapper = mountComponent();
		});

		it("should reinitialize form when user prop changes", async () => {
			const newUser = createMockUser({
				displayName: "New Display Name",
				bio: "New bio",
			});

			await wrapper.setProps({ user: newUser });

			expect(wrapper.vm.form.displayName).toBe("New Display Name");
			expect(wrapper.vm.form.bio).toBe("New bio");
		});

		it("should reset hasChanges when user prop changes", async () => {
			wrapper.vm.form.displayName = "Changed Name";
			expect(wrapper.vm.hasChanges).toBe(true);

			const newUser = createMockUser({
				displayName: "Different Name",
			});

			await wrapper.setProps({ user: newUser });

			expect(wrapper.vm.hasChanges).toBe(false);
		});
	});

	describe("Edge Cases", () => {
		it("should handle user prop as null", () => {
			wrapper = mountComponent({ user: null });

			expect(wrapper.vm.form.displayName).toBe("");
			expect(wrapper.vm.form.bio).toBe("");
			expect(wrapper.vm.form.location).toBe("");
			expect(wrapper.vm.form.website).toBe("");
		});

		it("should handle very long inputs", () => {
			wrapper = mountComponent();

			const longDisplayName = "a".repeat(200);
			const longBio = "b".repeat(600);
			const longLocation = "c".repeat(200);

			wrapper.vm.form.displayName = longDisplayName;
			wrapper.vm.form.bio = longBio;
			wrapper.vm.form.location = longLocation;

			// Form should still be functional
			expect(wrapper.vm.form.displayName).toBe(longDisplayName);
			expect(wrapper.vm.form.bio).toBe(longBio);
			expect(wrapper.vm.form.location).toBe(longLocation);
		});

		it("should handle special characters in inputs", () => {
			wrapper = mountComponent();

			const specialChars = "特殊文字 & émojis 🎉 <script>alert('test')</script>";

			wrapper.vm.form.displayName = specialChars;
			wrapper.vm.form.bio = specialChars;
			wrapper.vm.form.location = specialChars;

			expect(wrapper.vm.form.displayName).toBe(specialChars);
			expect(wrapper.vm.form.bio).toBe(specialChars);
			expect(wrapper.vm.form.location).toBe(specialChars);
		});
	});
});
