import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ConfigManager } from "../../src/config";
import type { ZxcvMetadata } from "../../src/types";
import { TEST_CWD, TEST_DIR, TEST_HOME } from "../setup";

describe("ConfigManager", () => {
	beforeEach(() => {
		process.chdir(TEST_CWD);
	});

	test("should create config directory on initialization", () => {
		const _config = new ConfigManager();
		const configDir = join(TEST_HOME, ".zxcv");
		const rulesDir = join(configDir, "rules");

		// ConfigManager creates dirs in homedir(), which should be TEST_HOME
		expect(existsSync(configDir)).toBe(true);
		expect(existsSync(rulesDir)).toBe(true);
	});

	test("should create default config file if not exists", () => {
		const _config = new ConfigManager();
		const configFile = join(TEST_HOME, ".zxcv", "config.json");

		expect(existsSync(configFile)).toBe(true);

		const savedConfig = JSON.parse(readFileSync(configFile, "utf-8"));
		expect(savedConfig.apiUrl).toBe("https://zxcv-backend-and-frontend.mattya.workers.dev/api");
		expect(savedConfig.rulesDir).toBe(join(TEST_HOME, ".zxcv", "rules"));
		expect(savedConfig.symlinkDir).toBe("rules");
	});

	test("should load existing config file", () => {
		const configDir = join(TEST_HOME, ".zxcv");
		mkdirSync(configDir, { recursive: true });

		const customConfig = {
			rulesDir: join(TEST_HOME, ".zxcv", "rules"),
			symlinkDir: "custom-rules",
			apiUrl: "https://custom-api.example.com",
			auth: {
				token: "test-token",
			},
		};

		writeFileSync(join(configDir, "config.json"), JSON.stringify(customConfig, null, 2));

		const config = new ConfigManager();
		expect(config.getApiUrl()).toBe("https://custom-api.example.com");
		expect(config.getAuthToken()).toBe("test-token");
	});

	test("should prioritize environment variable for API URL", () => {
		process.env.ZXCV_API_URL = "https://env-api.example.com";

		// Create new instance after setting env var
		const config = new ConfigManager();

		expect(config.getApiUrl()).toBe("https://env-api.example.com");

		// Clean up
		process.env.ZXCV_API_URL = undefined;
	});

	test("should load project config and override global config", () => {
		const projectConfig = {
			rulesDir: "./custom-rules",
			remoteUrl: "https://project-api.example.com",
		};

		writeFileSync(join(TEST_CWD, ".zxcvrc.json"), JSON.stringify(projectConfig, null, 2));

		const config = new ConfigManager();
		const finalConfig = config.getConfig();

		expect(finalConfig.apiUrl).toBe("https://project-api.example.com");
		expect(finalConfig.symlinkDir).toBe("./custom-rules");
	});

	test("should save and load metadata", () => {
		const config = new ConfigManager();
		const metadata: ZxcvMetadata = {
			version: "1.0.0",
			lastSync: new Date().toISOString(),
			rules: [
				{
					name: "test-rule",
					path: "test-id",
					owner: "testuser",
					version: "1.0.0",
					pulledAt: new Date().toISOString(),
				},
			],
		};

		config.saveMetadata(metadata);
		const loadedMetadata = config.loadMetadata();

		expect(loadedMetadata).toEqual(metadata);
		expect(existsSync(join(TEST_CWD, "zxcv-metadata.json"))).toBe(true);
	});

	test("should return null when metadata doesn't exist", () => {
		const config = new ConfigManager();
		const metadata = config.loadMetadata();

		expect(metadata).toBeNull();
	});

	test("should update auth token", () => {
		const config = new ConfigManager();
		config.setAuthToken("new-token");

		expect(config.getAuthToken()).toBe("new-token");

		// Verify it's persisted
		const newConfig = new ConfigManager();
		expect(newConfig.getAuthToken()).toBe("new-token");
	});

	test("should get correct symlink directory", () => {
		const config = new ConfigManager();
		const symlinkDir = config.getSymlinkDir();

		// Normalize path for comparison
		// const expected = join(TEST_CWD, "rules");
		expect(symlinkDir).toContain("rules");
		expect(symlinkDir).toContain("zxcv-test");
	});

	test("should get correct rules directory", () => {
		const config = new ConfigManager();
		const rulesDir = config.getRulesDir();

		expect(rulesDir).toContain(".zxcv");
		expect(rulesDir).toContain("rules");
	});
});
