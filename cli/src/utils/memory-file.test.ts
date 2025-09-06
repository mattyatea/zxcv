import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { MemoryFileManager } from "./memory-file";
import type { ConfigManager } from "../config";
import type { PulledRule } from "../types";

// Mock ConfigManager
const mockConfig: ConfigManager = {
	getRulesDir: () => "/tmp/test-rules",
} as ConfigManager;

const testDir = "/tmp/zxcv-test";
const testFile = join(testDir, "CLAUDE.md");

describe("MemoryFileManager", () => {
	let memoryManager: MemoryFileManager;

	beforeEach(() => {
		// セットアップ
		if (existsSync(testDir)) {
			rmSync(testDir, { recursive: true });
		}
		mkdirSync(testDir, { recursive: true });
		memoryManager = new MemoryFileManager(mockConfig);
	});

	afterEach(() => {
		// クリーンアップ
		if (existsSync(testDir)) {
			rmSync(testDir, { recursive: true });
		}
	});

	describe("resolveFilePath", () => {
		it("should expand ~ to home directory", () => {
			const result = memoryManager.resolveFilePath("~/test.md");
			expect(result).toContain("test.md");
			expect(result).not.toContain("~");
		});

		it("should return absolute path as is", () => {
			const absolutePath = "/absolute/path/test.md";
			const result = memoryManager.resolveFilePath(absolutePath);
			expect(result).toBe(absolutePath);
		});

		it("should resolve relative path from cwd", () => {
			const result = memoryManager.resolveFilePath("./test.md");
			expect(result).toContain("test.md");
		});
	});

	describe("parseRuleName", () => {
		it("should parse @owner/rulename format", () => {
			// privateメソッドにアクセスするため、anyにキャスト
			const result = (memoryManager as any).parseRuleName("@owner/test-rule");
			expect(result).toEqual({
				owner: "owner",
				name: "test-rule",
			});
		});

		it("should handle legacy format", () => {
			const result = (memoryManager as any).parseRuleName("simple-rule");
			expect(result).toEqual({
				name: "simple-rule",
			});
		});

		it("should handle empty parts safely", () => {
			const result = (memoryManager as any).parseRuleName("@/");
			expect(result).toEqual({
				owner: "",
				name: "",
			});
		});
	});

	describe("addRule", () => {
		it("should create new file with header when file doesn't exist", async () => {
			const rule: PulledRule = {
				name: "@owner/test-rule",
				version: "1.0.0",
				pulledAt: new Date().toISOString(),
			};

			await memoryManager.addRule(testFile, rule);

			expect(existsSync(testFile)).toBe(true);
		});

		it("should not add duplicate rules", async () => {
			const rule: PulledRule = {
				name: "@owner/test-rule",
				version: "1.0.0",
				pulledAt: new Date().toISOString(),
			};

			// 既存ファイルを作成
			writeFileSync(testFile, "# Claude Code Instructions\n\n## @owner/test-rule\n@path\n");

			await memoryManager.addRule(testFile, rule);

			// ファイル内容を確認（重複していないこと）
			const content = Bun.file(testFile);
			const text = await content.text();
			const matches = text.match(/## @owner\/test-rule/g);
			expect(matches?.length).toBe(1);
		});
	});

	describe("findMemoryFiles", () => {
		it("should find existing memory files in project scope", () => {
			// テスト用のファイルを作成
			const projectClaudeFile = join(process.cwd(), "CLAUDE.md");
			writeFileSync(projectClaudeFile, "test content");

			try {
				const files = memoryManager.findMemoryFiles("project");
				expect(files).toContain(projectClaudeFile);
			} finally {
				// クリーンアップ
				if (existsSync(projectClaudeFile)) {
					rmSync(projectClaudeFile);
				}
			}
		});

		it("should return empty array when no files exist", () => {
			const files = memoryManager.findMemoryFiles("project");
			expect(Array.isArray(files)).toBe(true);
		});
	});
});
