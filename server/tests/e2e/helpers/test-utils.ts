import { expect, type Page } from "@playwright/test";

export async function waitForNetworkIdle(page: Page, timeout = 3000) {
	await page.waitForLoadState("networkidle", { timeout });
}

export async function waitForToast(page: Page, message: string, type?: "success" | "error") {
	const toastSelector = type
		? `[data-testid="toast-${type}"]:has-text("${message}")`
		: `[data-testid^="toast-"]:has-text("${message}")`;
	
	await page.waitForSelector(toastSelector, { timeout: 5000 });
}

export async function dismissToast(page: Page) {
	const closeButton = page.locator('[data-testid="toast-close"]');
	if (await closeButton.isVisible()) {
		await closeButton.click();
		await closeButton.waitFor({ state: "hidden" });
	}
}

export async function checkAccessibility(page: Page) {
	const violations = await page.evaluate(() => {
		const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
		const issues: string[] = [];
		
		let lastLevel = 0;
		headings.forEach((heading) => {
			const level = Number.parseInt(heading.tagName[1]);
			if (level - lastLevel > 1) {
				issues.push(`Skipped heading level: ${heading.tagName} after H${lastLevel}`);
			}
			lastLevel = level;
		});
		
		const images = Array.from(document.querySelectorAll("img"));
		images.forEach((img) => {
			if (!img.alt && !img.getAttribute("aria-label")) {
				issues.push(`Image without alt text: ${img.src}`);
			}
		});
		
		const buttons = Array.from(document.querySelectorAll("button"));
		buttons.forEach((button) => {
			if (!button.textContent?.trim() && !button.getAttribute("aria-label")) {
				issues.push("Button without accessible text");
			}
		});
		
		return issues;
	});
	
	expect(violations).toHaveLength(0);
}

export async function generateUniqueId(): string {
	return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}