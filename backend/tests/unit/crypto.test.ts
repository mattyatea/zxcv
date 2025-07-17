import { describe, expect, it } from "vitest";
import { generateId, hashPassword, verifyPassword } from "../../src/utils/crypto";

describe("Crypto utilities", () => {
	describe("generateId", () => {
		it("should generate a unique ID", () => {
			const id1 = generateId();
			const id2 = generateId();
			
			expect(id1).toBeDefined();
			expect(id2).toBeDefined();
			expect(id1).not.toBe(id2);
			expect(typeof id1).toBe("string");
			expect(id1.length).toBeGreaterThan(0);
		});

		it("should generate IDs with consistent format", () => {
			const id = generateId();
			
			// Should be a string with alphanumeric characters and hyphens (UUID format)
			expect(id).toMatch(/^[a-zA-Z0-9-]+$/);
		});
	});

	describe("hashPassword", () => {
		it("should hash a password", async () => {
			const password = "testpassword123";
			const hash = await hashPassword(password);
			
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
			expect(hash).not.toBe(password);
			expect(hash.length).toBeGreaterThan(0);
		});

		it("should generate different hashes for same password", async () => {
			const password = "testpassword123";
			const hash1 = await hashPassword(password);
			const hash2 = await hashPassword(password);
			
			expect(hash1).not.toBe(hash2);
		});

		it("should handle empty password", async () => {
			const password = "";
			const hash = await hashPassword(password);
			
			expect(hash).toBeDefined();
			expect(typeof hash).toBe("string");
		});
	});

	describe("verifyPassword", () => {
		it("should verify correct password", async () => {
			const password = "testpassword123";
			const hash = await hashPassword(password);
			const isValid = await verifyPassword(password, hash);
			
			expect(isValid).toBe(true);
		});

		it("should reject incorrect password", async () => {
			const password = "testpassword123";
			const wrongPassword = "wrongpassword";
			const hash = await hashPassword(password);
			const isValid = await verifyPassword(wrongPassword, hash);
			
			expect(isValid).toBe(false);
		});

		it("should handle empty password verification", async () => {
			const password = "";
			const hash = await hashPassword(password);
			const isValid = await verifyPassword(password, hash);
			
			expect(isValid).toBe(true);
		});

		it("should handle malformed hash", async () => {
			const password = "testpassword123";
			const malformedHash = "not-a-valid-hash";
			const isValid = await verifyPassword(password, malformedHash);
			
			expect(isValid).toBe(false);
		});
	});
});