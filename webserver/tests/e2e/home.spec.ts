import { test, expect } from "@playwright/test";
import { login, testUsers } from "./helpers/auth";
import { checkAccessibility } from "./helpers/test-utils";

test.describe("Home Page", () => {
	test("should display the landing page", async ({ page }) => {
		await page.goto("/");
		
		await expect(page).toHaveTitle(/zxcv/);
		await expect(page.locator("h1")).toContainText("AI Coding Rules");
		
		await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
		await expect(page.locator('[data-testid="features-section"]')).toBeVisible();
		await expect(page.locator('[data-testid="cta-section"]')).toBeVisible();
	});
	
	test("should have working navigation links", async ({ page }) => {
		await page.goto("/");
		
		await page.click('a[href="/explore"]');
		await expect(page).toHaveURL("/explore");
		
		await page.click('[data-testid="logo"]');
		await expect(page).toHaveURL("/");
		
		await page.click('a[href="/docs"]');
		await expect(page).toHaveURL("/docs");
	});
	
	test("should display different content for authenticated users", async ({ page }) => {
		await login(page, testUsers.default);
		await page.goto("/");
		
		await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
		await expect(page.locator('[data-testid="dashboard-link"]')).toBeVisible();
		await expect(page.locator('[data-testid="create-rule-button"]')).toBeVisible();
	});
	
	test("should pass accessibility checks", async ({ page }) => {
		await page.goto("/");
		await checkAccessibility(page);
	});
});

test.describe("Navigation", () => {
	test("should navigate through main menu items", async ({ page }) => {
		await page.goto("/");
		
		const menuItems = [
			{ selector: 'a[href="/explore"]', url: "/explore", title: "Explore" },
			{ selector: 'a[href="/docs"]', url: "/docs", title: "Documentation" },
			{ selector: 'a[href="/about"]', url: "/about", title: "About" },
		];
		
		for (const item of menuItems) {
			await page.click(item.selector);
			await expect(page).toHaveURL(item.url);
			await expect(page).toHaveTitle(new RegExp(item.title));
		}
	});
	
	test("should show mobile menu on small screens", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");
		
		await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
		await expect(page.locator('[data-testid="desktop-menu"]')).not.toBeVisible();
		
		await page.click('[data-testid="mobile-menu-button"]');
		await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
		
		await page.click('a[href="/explore"]');
		await expect(page).toHaveURL("/explore");
		await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
	});
	
	test("should handle 404 pages", async ({ page }) => {
		await page.goto("/non-existent-page");
		
		await expect(page.locator("h1")).toContainText("404");
		await expect(page.locator('[data-testid="back-home-button"]')).toBeVisible();
		
		await page.click('[data-testid="back-home-button"]');
		await expect(page).toHaveURL("/");
	});
});