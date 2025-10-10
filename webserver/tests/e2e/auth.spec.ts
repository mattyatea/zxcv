import { test, expect } from "@playwright/test";
import { register, login, logout, testUsers } from "./helpers/auth";
import { waitForToast, generateUniqueId } from "./helpers/test-utils";

test.describe("Authentication Flow", () => {
	test.describe("Registration", () => {
		test("should register a new user successfully", async ({ page }) => {
			const uniqueId = await generateUniqueId();
			const newUser = {
				username: `user-${uniqueId}`,
				email: `test-${uniqueId}@example.com`,
				password: "TestPassword123!",
			};
			
			await page.goto("/register");
			
			await expect(page).toHaveTitle(/Register/);
			await expect(page.locator("h1")).toContainText("Create Account");
			
			await page.fill('input[name="username"]', newUser.username);
			await page.fill('input[name="email"]', newUser.email);
			await page.fill('input[name="password"]', newUser.password);
			await page.fill('input[name="confirmPassword"]', newUser.password);
			
			await page.click('button[type="submit"]');
			
			await page.waitForURL("/verify-email");
			await expect(page.locator("h1")).toContainText("Verify Email");
			await waitForToast(page, "Registration successful", "success");
		});
		
		test("should show validation errors for invalid input", async ({ page }) => {
			await page.goto("/register");
			
			await page.fill('input[name="username"]', "ab");
			await page.fill('input[name="email"]', "invalid-email");
			await page.fill('input[name="password"]', "weak");
			await page.fill('input[name="confirmPassword"]', "different");
			
			await page.click('button[type="submit"]');
			
			await expect(page.locator('[data-testid="username-error"]')).toContainText("Username must be at least 3 characters");
			await expect(page.locator('[data-testid="email-error"]')).toContainText("Invalid email format");
			await expect(page.locator('[data-testid="password-error"]')).toContainText("Password must be at least 8 characters");
			await expect(page.locator('[data-testid="confirmPassword-error"]')).toContainText("Passwords do not match");
		});
		
		test("should prevent duplicate username registration", async ({ page }) => {
			await page.goto("/register");
			
			await page.fill('input[name="username"]', testUsers.default.username);
			await page.fill('input[name="email"]', "newemail@example.com");
			await page.fill('input[name="password"]', testUsers.default.password);
			await page.fill('input[name="confirmPassword"]', testUsers.default.password);
			
			await page.click('button[type="submit"]');
			
			await waitForToast(page, "Username already exists", "error");
		});
	});
	
	test.describe("Login", () => {
		test("should login with valid credentials", async ({ page }) => {
			await page.goto("/login");
			
			await expect(page).toHaveTitle(/Login/);
			await expect(page.locator("h1")).toContainText("Sign In");
			
			await page.fill('input[name="username"]', testUsers.default.username);
			await page.fill('input[name="password"]', testUsers.default.password);
			
			await page.click('button[type="submit"]');
			
			await page.waitForURL("/");
			await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
			await waitForToast(page, "Login successful", "success");
		});
		
		test("should show error for invalid credentials", async ({ page }) => {
			await page.goto("/login");
			
			await page.fill('input[name="username"]', "wronguser");
			await page.fill('input[name="password"]', "wrongpassword");
			
			await page.click('button[type="submit"]');
			
			await waitForToast(page, "Invalid credentials", "error");
			await expect(page).toHaveURL("/login");
		});
		
		test("should redirect to login when accessing protected route", async ({ page }) => {
			await page.goto("/rules/new");
			
			await page.waitForURL("/login?redirect=/rules/new");
			await expect(page.locator("h1")).toContainText("Sign In");
		});
	});
	
	test.describe("Logout", () => {
		test("should logout successfully", async ({ page }) => {
			await login(page, testUsers.default);
			
			await page.click('[data-testid="user-menu"]');
			await page.click('[data-testid="logout-button"]');
			
			await page.waitForURL("/");
			await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
			await waitForToast(page, "Logged out successfully", "success");
		});
	});
	
	test.describe("Session Management", () => {
		test("should maintain session across page refreshes", async ({ page }) => {
			await login(page, testUsers.default);
			
			await page.reload();
			
			await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
		});
		
		test("should handle expired session gracefully", async ({ page, context }) => {
			await login(page, testUsers.default);
			
			await context.clearCookies();
			await page.evaluate(() => localStorage.clear());
			
			await page.goto("/rules/new");
			
			await page.waitForURL("/login?redirect=/rules/new");
			await waitForToast(page, "Session expired. Please login again", "error");
		});
	});
});