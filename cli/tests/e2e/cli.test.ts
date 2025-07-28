import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";
import { TEST_CWD } from "../setup";

describe("CLI E2E tests", () => {
	const cli = join(process.cwd(), "src", "index.ts");

	test("should show help", async () => {
		const result = await $`bun ${cli} --help`.quiet();
		expect(result.stdout.toString()).toContain("AI coding rules management CLI tool");
		expect(result.stdout.toString()).toContain("Commands:");
		expect(result.stdout.toString()).toContain("init");
		expect(result.stdout.toString()).toContain("add");
		expect(result.stdout.toString()).toContain("remove");
	});

	test("should show version", async () => {
		const result = await $`bun ${cli} --version`.quiet();
		expect(result.stdout.toString().trim()).toBe("0.1.0");
	});

	test("should initialize project", async () => {
		process.chdir(TEST_CWD);
		const result = await $`bun ${cli} init --yes`.quiet();

		expect(result.exitCode).toBe(0);
		expect(existsSync(join(TEST_CWD, "zxcv-metadata.json"))).toBe(true);

		const metadata = JSON.parse(readFileSync(join(TEST_CWD, "zxcv-metadata.json"), "utf-8"));
		expect(metadata.version).toBe("1.0.0");
		expect(metadata.rules).toEqual([]);
	});

	test("should show auth commands", async () => {
		const result = await $`bun ${cli} auth --help`.quiet();
		expect(result.stdout.toString()).toContain("Authentication management");
		expect(result.stdout.toString()).toContain("login");
		expect(result.stdout.toString()).toContain("logout");
		expect(result.stdout.toString()).toContain("register");
	});

	test("should list empty rules", async () => {
		process.chdir(TEST_CWD);
		await $`bun ${cli} init --yes`.quiet();

		const result = await $`bun ${cli} list`.quiet();
		expect(result.stdout.toString()).toContain("No rules pulled yet");
	});
});
