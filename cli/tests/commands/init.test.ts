import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createInitCommand } from "../../src/commands/init";
import type { ZxcvMetadata } from "../../src/types";
import { TEST_CWD } from "../setup";

// Mock inquirer
mock.module("inquirer", () => ({
	default: {
		prompt: mock(),
	},
}));

describe("init command", () => {
	let originalArgv: string[];

	beforeEach(() => {
		originalArgv = process.argv;
		process.chdir(TEST_CWD);

		// Reset inquirer mock
		const inquirer = require("inquirer");
		inquirer.default.prompt.mockReset();
	});

	afterEach(() => {
		process.argv = originalArgv;
	});

	test("should initialize with default values when using --yes flag", async () => {
		const command = createInitCommand();
		process.argv = ["node", "zxcv", "init", "--yes"];

		await new Promise<void>((resolve) => {
			command.parse(process.argv, { from: "node" });
			// Give time for async operations
			setTimeout(resolve, 200);
		});

		// Check metadata file
		const metadataPath = join(TEST_CWD, "zxcv-metadata.json");
		expect(existsSync(metadataPath)).toBe(true);

		const metadata: ZxcvMetadata = JSON.parse(
			readFileSync(metadataPath, "utf-8"),
		);
		expect(metadata.version).toBe("1.0.0");
		expect(metadata.rules).toEqual([]);
		expect(metadata.lastSync).toBeDefined();

		// Should not create .zxcvrc.json with default values
		const configPath = join(TEST_CWD, ".zxcvrc.json");
		expect(existsSync(configPath)).toBe(false);
	});

	test("should initialize with custom values from prompts", async () => {
		const inquirer = require("inquirer");
		inquirer.default.prompt.mockResolvedValueOnce({
			projectName: "my-awesome-project",
			rulesDir: "custom-rules",
		});

		const command = createInitCommand();
		process.argv = ["node", "zxcv", "init"];

		await new Promise<void>((resolve) => {
			command.parse(process.argv, { from: "node" });
			// Give time for async operations
			setTimeout(resolve, 200);
		});

		// Check metadata file
		const metadataPath = join(TEST_CWD, "zxcv-metadata.json");
		expect(existsSync(metadataPath)).toBe(true);

		// Check .zxcvrc.json
		const configPath = join(TEST_CWD, ".zxcvrc.json");
		expect(existsSync(configPath)).toBe(true);

		const config = JSON.parse(readFileSync(configPath, "utf-8"));
		expect(config.rulesDir).toBe("custom-rules");
	});

	test("should not create .zxcvrc.json when using default rules directory", async () => {
		const inquirer = require("inquirer");
		inquirer.default.prompt.mockResolvedValueOnce({
			projectName: "test-project",
			rulesDir: "rules", // default value
		});

		const command = createInitCommand();
		process.argv = ["node", "zxcv", "init"];

		await new Promise<void>((resolve) => {
			command.parse(process.argv, { from: "node" });
			// Give time for async operations
			setTimeout(resolve, 200);
		});

		// Check metadata file exists
		const metadataPath = join(TEST_CWD, "zxcv-metadata.json");
		expect(existsSync(metadataPath)).toBe(true);

		// Check .zxcvrc.json doesn't exist
		const configPath = join(TEST_CWD, ".zxcvrc.json");
		expect(existsSync(configPath)).toBe(false);
	});
});
