import type { Page } from "@playwright/test";

export interface TestUser {
	username: string;
	email: string;
	password: string;
}

export const testUsers = {
	default: {
		username: "testuser",
		email: "test@example.com",
		password: "TestPassword123!",
	},
	admin: {
		username: "adminuser",
		email: "admin@example.com",
		password: "AdminPassword123!",
	},
} as const;

export async function login(page: Page, user: TestUser) {
	await page.goto("/login");
	await page.fill('input[name="username"]', user.username);
	await page.fill('input[name="password"]', user.password);
	await page.click('button[type="submit"]');
	
	await page.waitForURL("/");
	await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
}

export async function register(page: Page, user: TestUser) {
	await page.goto("/register");
	await page.fill('input[name="username"]', user.username);
	await page.fill('input[name="email"]', user.email);
	await page.fill('input[name="password"]', user.password);
	await page.fill('input[name="confirmPassword"]', user.password);
	await page.click('button[type="submit"]');
	
	await page.waitForURL("/verify-email");
}

export async function logout(page: Page) {
	await page.click('[data-testid="user-menu"]');
	await page.click('[data-testid="logout-button"]');
	await page.waitForURL("/");
}