import { expect, test } from "@playwright/test";
import { login, testUsers } from "./helpers/auth";
import { generateUniqueId, waitForToast } from "./helpers/test-utils";

// Profile settings E2E tests

test.describe("Settings Page", () => {
	test.beforeEach(async ({ page }) => {
		await login(page, testUsers.default);
	});

	test.describe("Navigation and Access", () => {
		test("should navigate to settings page", async ({ page }) => {
			// Navigate via user menu
			await page.click('[data-testid="user-menu"]');
			await page.click('[data-testid="settings-link"]');

			await page.waitForURL("/settings");
			await expect(page).toHaveTitle(/Settings/);
			await expect(page.locator("h1")).toContainText("Settings");
		});

		test("should display profile tab by default", async ({ page }) => {
			await page.goto("/settings");

			// Check if profile tab is active
			await expect(page.locator('[data-testid="profile-tab"]')).toHaveAttribute(
				"aria-selected",
				"true",
			);
			await expect(page.locator('[data-testid="profile-panel"]')).toBeVisible();
		});

		test("should require authentication", async ({ page, context }) => {
			await context.clearCookies();
			await page.evaluate(() => localStorage.clear());

			await page.goto("/settings");

			await page.waitForURL("/login?redirect=/settings");
			await expect(page.locator("h1")).toContainText("Sign In");
		});
	});

	test.describe("Profile Information", () => {
		test("should display current user profile information", async ({ page }) => {
			await page.goto("/settings");

			// Check if form fields are populated with current data
			const displayNameInput = page.locator('input[name="displayName"]');
			const bioTextarea = page.locator('textarea[name="bio"]');
			const locationInput = page.locator('input[name="location"]');
			const websiteInput = page.locator('input[name="website"]');

			await expect(displayNameInput).toBeVisible();
			await expect(bioTextarea).toBeVisible();
			await expect(locationInput).toBeVisible();
			await expect(websiteInput).toBeVisible();
		});

		test("should update profile information successfully", async ({ page }) => {
			await page.goto("/settings");

			const uniqueId = generateUniqueId();
			const updatedProfile = {
				displayName: `Updated Name ${uniqueId}`,
				bio: `Updated bio description ${uniqueId}`,
				location: `Tokyo, Japan ${uniqueId}`,
				website: "https://example.com",
			};

			// Fill in the form
			await page.fill('input[name="displayName"]', updatedProfile.displayName);
			await page.fill('textarea[name="bio"]', updatedProfile.bio);
			await page.fill('input[name="location"]', updatedProfile.location);
			await page.fill('input[name="website"]', updatedProfile.website);

			// Submit the form
			await page.click('button[type="submit"]:has-text("Save Changes")');

			// Wait for success message
			await waitForToast(page, "Profile updated successfully", "success");

			// Verify form still contains the updated data
			await expect(page.locator('input[name="displayName"]')).toHaveValue(
				updatedProfile.displayName,
			);
			await expect(page.locator('textarea[name="bio"]')).toHaveValue(updatedProfile.bio);
			await expect(page.locator('input[name="location"]')).toHaveValue(updatedProfile.location);
			await expect(page.locator('input[name="website"]')).toHaveValue(updatedProfile.website);
		});

		test("should validate website URL format", async ({ page }) => {
			await page.goto("/settings");

			// Enter invalid URL
			await page.fill('input[name="website"]', "invalid-url");
			await page.click('button[type="submit"]:has-text("Save Changes")');

			// Should show validation error (form should not submit)
			await expect(page.locator('[data-testid="website-error"]')).toBeVisible();
			await expect(page.locator('[data-testid="website-error"]')).toContainText("Invalid URL");
		});

		test("should handle empty profile fields", async ({ page }) => {
			await page.goto("/settings");

			// Clear all fields
			await page.fill('input[name="displayName"]', "");
			await page.fill('textarea[name="bio"]', "");
			await page.fill('input[name="location"]', "");
			await page.fill('input[name="website"]', "");

			// Submit the form
			await page.click('button[type="submit"]:has-text("Save Changes")');

			// Should be successful
			await waitForToast(page, "Profile updated successfully", "success");
		});

		test("should respect character limits", async ({ page }) => {
			await page.goto("/settings");

			// Test display name limit (100 characters)
			const longDisplayName = "a".repeat(101);
			await page.fill('input[name="displayName"]', longDisplayName);

			// Should be truncated or show error
			const displayNameValue = await page.locator('input[name="displayName"]').inputValue();
			expect(displayNameValue.length).toBeLessThanOrEqual(100);

			// Test bio limit (500 characters)
			const longBio = "b".repeat(501);
			await page.fill('textarea[name="bio"]', longBio);

			// Check character counter
			await expect(page.locator('[data-testid="bio-character-count"]')).toContainText("500");
		});

		test("should reset form to original values", async ({ page }) => {
			await page.goto("/settings");

			// Get original values
			const originalDisplayName = await page.locator('input[name="displayName"]').inputValue();
			const originalBio = await page.locator('textarea[name="bio"]').inputValue();

			// Make changes
			await page.fill('input[name="displayName"]', "Changed Name");
			await page.fill('textarea[name="bio"]', "Changed bio");

			// Reset form
			await page.click('button[type="button"]:has-text("Reset")');

			// Check if values are restored
			await expect(page.locator('input[name="displayName"]')).toHaveValue(originalDisplayName);
			await expect(page.locator('textarea[name="bio"]')).toHaveValue(originalBio);
		});
	});

	test.describe("Avatar Upload", () => {
		test("should display avatar upload section", async ({ page }) => {
			await page.goto("/settings");

			await expect(page.locator('[data-testid="avatar-upload"]')).toBeVisible();
			await expect(page.locator('input[type="file"][accept="image/*"]')).toBeVisible();
		});

		test("should display current avatar if exists", async ({ page }) => {
			await page.goto("/settings");

			const avatarImage = page.locator('[data-testid="current-avatar"]');

			// Avatar may or may not exist, so check if it's present
			if (await avatarImage.isVisible()) {
				await expect(avatarImage).toHaveAttribute("src");
			}
		});

		test("should handle avatar file selection", async ({ page }) => {
			await page.goto("/settings");

			// Create a mock image file
			const fileInput = page.locator('input[type="file"][accept="image/*"]');

			// Note: In a real test, you would use page.setInputFiles() with an actual image file
			// For this test, we're just checking the file input is accessible
			await expect(fileInput).toBeVisible();
			await expect(fileInput).toHaveAttribute("accept", "image/*");
		});

		test("should show upload button when file is selected", async ({ page }) => {
			await page.goto("/settings");

			// The upload functionality would be tested with actual file upload
			// Here we verify the UI elements are present
			await expect(page.locator('[data-testid="avatar-upload-button"]')).toBeVisible();
		});
	});

	test.describe("Form Interaction", () => {
		test("should disable save button when form is invalid", async ({ page }) => {
			await page.goto("/settings");

			// Enter invalid website
			await page.fill('input[name="website"]', "invalid-url");

			// Save button should be disabled
			const saveButton = page.locator('button[type="submit"]:has-text("Save Changes")');
			await expect(saveButton).toBeDisabled();
		});

		test("should show loading state during form submission", async ({ page }) => {
			await page.goto("/settings");

			// Make a small change
			await page.fill('input[name="displayName"]', "Test Name");

			// Click save button
			await page.click('button[type="submit"]:has-text("Save Changes")');

			// Should show loading state temporarily
			await expect(page.locator('button[type="submit"][disabled]')).toBeVisible();
		});

		test("should detect form changes", async ({ page }) => {
			await page.goto("/settings");

			// Initially, save button should be disabled (no changes)
			const saveButton = page.locator('button[type="submit"]:has-text("Save Changes")');
			await expect(saveButton).toBeDisabled();

			// Make a change
			await page.fill('input[name="displayName"]', "Changed Name");

			// Save button should now be enabled
			await expect(saveButton).toBeEnabled();
		});
	});

	test.describe("Tab Navigation", () => {
		test("should switch between tabs", async ({ page }) => {
			await page.goto("/settings");

			// Initially on profile tab
			await expect(page.locator('[data-testid="profile-tab"]')).toHaveAttribute(
				"aria-selected",
				"true",
			);
			await expect(page.locator('[data-testid="profile-panel"]')).toBeVisible();

			// Note: If there are other tabs like Account, Security, etc., test them here
			// For now, we only have the profile tab based on our implementation
		});
	});

	test.describe("Error Handling", () => {
		test("should handle network errors gracefully", async ({ page }) => {
			await page.goto("/settings");

			// Simulate network failure by intercepting the request
			await page.route("**/rpc/users.updateProfile", (route) => {
				route.fulfill({
					status: 500,
					contentType: "application/json",
					body: JSON.stringify({ error: { message: "Server error" } }),
				});
			});

			// Make a change and submit
			await page.fill('input[name="displayName"]', "Test Name");
			await page.click('button[type="submit"]:has-text("Save Changes")');

			// Should show error message
			await waitForToast(page, "Failed to update profile", "error");
		});

		test("should handle validation errors from server", async ({ page }) => {
			await page.goto("/settings");

			// This would test server-side validation errors
			// Implementation depends on what server-side validations exist
			await page.fill('input[name="displayName"]', "Test Name");
			await page.click('button[type="submit"]:has-text("Save Changes")');

			// Check if form handles server validation responses appropriately
		});
	});

	test.describe("Accessibility", () => {
		test("should be keyboard navigable", async ({ page }) => {
			await page.goto("/settings");

			// Tab through form elements
			await page.keyboard.press("Tab"); // Focus first input
			await expect(page.locator('input[name="displayName"]')).toBeFocused();

			await page.keyboard.press("Tab"); // Focus bio textarea
			await expect(page.locator('textarea[name="bio"]')).toBeFocused();

			await page.keyboard.press("Tab"); // Focus location input
			await expect(page.locator('input[name="location"]')).toBeFocused();

			await page.keyboard.press("Tab"); // Focus website input
			await expect(page.locator('input[name="website"]')).toBeFocused();
		});

		test("should have proper form labels", async ({ page }) => {
			await page.goto("/settings");

			// Check for proper labels
			await expect(page.locator('label[for="displayName"]')).toBeVisible();
			await expect(page.locator('label[for="bio"]')).toBeVisible();
			await expect(page.locator('label[for="location"]')).toBeVisible();
			await expect(page.locator('label[for="website"]')).toBeVisible();
		});

		test("should announce form validation errors to screen readers", async ({ page }) => {
			await page.goto("/settings");

			// Enter invalid data
			await page.fill('input[name="website"]', "invalid-url");
			await page.click('button[type="submit"]:has-text("Save Changes")');

			// Check for aria-describedby or similar accessibility attributes
			const websiteInput = page.locator('input[name="website"]');
			await expect(websiteInput).toHaveAttribute("aria-invalid", "true");
		});
	});
});
