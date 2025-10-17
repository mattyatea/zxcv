import { expect, test } from "@playwright/test";
import { login, testUsers } from "./helpers/auth";
import { generateUniqueId, waitForNetworkIdle, waitForToast } from "./helpers/test-utils";

test.describe("Rule Management", () => {
	test.beforeEach(async ({ page }) => {
		await login(page, testUsers.default);
	});

	test.describe("Rule Creation", () => {
		test("should create a new rule successfully", async ({ page }) => {
			const ruleName = `test-rule-${await generateUniqueId()}`;

			await page.goto("/rules/new");

			await expect(page).toHaveTitle(/Create Rule/);
			await expect(page.locator("h1")).toContainText("Create New Rule");

			await page.fill('input[name="name"]', ruleName);
			await page.fill('textarea[name="description"]', "This is a test rule description");
			await page.fill(
				'[data-testid="rule-content"]',
				"# Test Rule\n\nThis is the rule content in markdown.",
			);

			await page.selectOption('select[name="visibility"]', "public");

			await page.click('button[type="submit"]');

			await waitForToast(page, "Rule created successfully", "success");
			await page.waitForURL(/\/rules\/[^/]+$/);

			await expect(page.locator("h1")).toContainText(ruleName);
			await expect(page.locator('[data-testid="rule-description"]')).toContainText(
				"This is a test rule description",
			);
		});

		test("should validate required fields", async ({ page }) => {
			await page.goto("/rules/new");

			await page.click('button[type="submit"]');

			await expect(page.locator('[data-testid="name-error"]')).toContainText(
				"Rule name is required",
			);
			await expect(page.locator('[data-testid="content-error"]')).toContainText(
				"Rule content is required",
			);
		});

		test("should save draft automatically", async ({ page }) => {
			await page.goto("/rules/new");

			const draftName = `draft-${await generateUniqueId()}`;
			await page.fill('input[name="name"]', draftName);
			await page.fill('[data-testid="rule-content"]', "Draft content");

			await page.waitForTimeout(2000);

			await page.reload();

			await expect(page.locator('input[name="name"]')).toHaveValue(draftName);
			await expect(page.locator('[data-testid="rule-content"]')).toHaveValue("Draft content");
			await expect(page.locator('[data-testid="draft-indicator"]')).toContainText("Draft saved");
		});
	});

	test.describe("Rule Listing", () => {
		test("should display user rules", async ({ page }) => {
			await page.goto("/rules");

			await expect(page).toHaveTitle(/My Rules/);
			await expect(page.locator("h1")).toContainText("My Rules");

			await waitForNetworkIdle(page);

			const ruleCards = page.locator('[data-testid="rule-card"]');
			await expect(ruleCards).toHaveCount(await ruleCards.count());

			if ((await ruleCards.count()) > 0) {
				const firstRule = ruleCards.first();
				await expect(firstRule.locator('[data-testid="rule-name"]')).toBeVisible();
				await expect(firstRule.locator('[data-testid="rule-visibility"]')).toBeVisible();
				await expect(firstRule.locator('[data-testid="rule-updated"]')).toBeVisible();
			}
		});

		test("should search rules", async ({ page }) => {
			await page.goto("/rules");

			await page.fill('[data-testid="search-input"]', "test");
			await page.keyboard.press("Enter");

			await waitForNetworkIdle(page);

			const ruleCards = page.locator('[data-testid="rule-card"]');
			for (const card of await ruleCards.all()) {
				const name = await card.locator('[data-testid="rule-name"]').textContent();
				const description = await card.locator('[data-testid="rule-description"]').textContent();
				expect(name?.toLowerCase() + description?.toLowerCase()).toContain("test");
			}
		});

		test("should filter by visibility", async ({ page }) => {
			await page.goto("/rules");

			await page.click('[data-testid="visibility-filter"]');
			await page.click('[data-testid="filter-public"]');

			await waitForNetworkIdle(page);

			const visibilityBadges = page.locator('[data-testid="rule-visibility"]');
			for (const badge of await visibilityBadges.all()) {
				await expect(badge).toContainText("Public");
			}
		});
	});

	test.describe("Rule Editing", () => {
		test("should edit an existing rule", async ({ page }) => {
			await page.goto("/rules");
			await waitForNetworkIdle(page);

			const firstRuleCard = page.locator('[data-testid="rule-card"]').first();
			await firstRuleCard.click();

			await page.click('[data-testid="edit-rule-button"]');

			const updatedDescription = `Updated description ${await generateUniqueId()}`;
			await page.fill('textarea[name="description"]', updatedDescription);

			await page.click('button[type="submit"]');

			await waitForToast(page, "Rule updated successfully", "success");
			await expect(page.locator('[data-testid="rule-description"]')).toContainText(
				updatedDescription,
			);
		});

		test("should show version history", async ({ page }) => {
			await page.goto("/rules");
			await waitForNetworkIdle(page);

			const firstRuleCard = page.locator('[data-testid="rule-card"]').first();
			await firstRuleCard.click();

			await page.click('[data-testid="version-history-button"]');

			await expect(page.locator('[data-testid="version-history-modal"]')).toBeVisible();
			await expect(page.locator('[data-testid="version-item"]')).toHaveCount(
				await page.locator('[data-testid="version-item"]').count(),
			);
		});
	});

	test.describe("Rule Deletion", () => {
		test("should delete a rule with confirmation", async ({ page }) => {
			const ruleName = `delete-rule-${await generateUniqueId()}`;

			await page.goto("/rules/new");
			await page.fill('input[name="name"]', ruleName);
			await page.fill('[data-testid="rule-content"]', "To be deleted");
			await page.click('button[type="submit"]');

			await waitForToast(page, "Rule created successfully", "success");
			await page.waitForURL(/\/rules\/[^/]+$/);

			await page.click('[data-testid="delete-rule-button"]');

			await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
			await expect(page.locator('[data-testid="confirm-message"]')).toContainText(
				"Are you sure you want to delete this rule?",
			);

			await page.click('[data-testid="confirm-delete"]');

			await waitForToast(page, "Rule deleted successfully", "success");
			await page.waitForURL("/rules");
		});
	});

	test.describe("Rule Pull (CLI)", () => {
		test("should display pull command", async ({ page }) => {
			await page.goto("/rules");
			await waitForNetworkIdle(page);

			const firstRuleCard = page.locator('[data-testid="rule-card"]').first();
			await firstRuleCard.click();

			await page.click('[data-testid="pull-command-button"]');

			const pullCommand = page.locator('[data-testid="pull-command"]');
			await expect(pullCommand).toBeVisible();
			await expect(pullCommand).toContainText("zxcv pull");

			await page.click('[data-testid="copy-command"]');
			await waitForToast(page, "Command copied to clipboard", "success");
		});
	});
});
