import { afterEach, beforeEach } from "bun:test";
import { randomBytes } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Create unique test directories for each test run
const testId = randomBytes(8).toString("hex");
export const TEST_DIR = join(tmpdir(), `zxcv-test-${testId}`);
export const TEST_HOME = join(TEST_DIR, "home");
export const TEST_CWD = join(TEST_DIR, "project");

let originalHome: string | undefined;
let originalUserProfile: string | undefined;
let originalCwd: string;

beforeEach(() => {
	// Save original values
	originalHome = process.env.HOME;
	originalUserProfile = process.env.USERPROFILE;
	originalCwd = process.cwd();

	// Clean up and create test directories
	try {
		rmSync(TEST_DIR, { recursive: true, force: true });
	} catch {
		// Ignore errors if directory doesn't exist
	}

	mkdirSync(TEST_HOME, { recursive: true });
	mkdirSync(TEST_CWD, { recursive: true });

	// Set test environment variables
	process.env.HOME = TEST_HOME;
	process.env.USERPROFILE = TEST_HOME; // For Windows
});

afterEach(() => {
	// Restore original values
	process.chdir(originalCwd);

	if (originalHome !== undefined) {
		process.env.HOME = originalHome;
	} else {
		process.env.HOME = undefined as any;
	}

	if (originalUserProfile !== undefined) {
		process.env.USERPROFILE = originalUserProfile;
	} else {
		process.env.USERPROFILE = undefined as any;
	}

	process.env.ZXCV_API_URL = undefined as any;

	// Clean up test directories
	try {
		rmSync(TEST_DIR, { recursive: true, force: true });
	} catch {
		// Ignore errors if directory doesn't exist
	}
});
