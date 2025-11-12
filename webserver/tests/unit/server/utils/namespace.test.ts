import { ORPCError } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	checkNamespaceAvailable,
	parseRulePath,
	validateRuleOwnership,
} from "~/server/utils/namespace";

describe("namespace utilities", () => {
	let mockPrisma: {
		user: {
			findUnique: ReturnType<typeof vi.fn>;
		};
		organization: {
			findUnique: ReturnType<typeof vi.fn>;
		};
	};

	beforeEach(() => {
		vi.clearAllMocks();

		mockPrisma = {
			user: {
				findUnique: vi.fn(),
			},
			organization: {
				findUnique: vi.fn(),
			},
		};
	});

	describe("parseRulePath", () => {
		it("should parse valid rule path with @", () => {
			const result = parseRulePath("@owner/rule-name");
			expect(result).toEqual({
				owner: "owner",
				ruleName: "rule-name",
			});
		});

		it("should parse valid rule path without @", () => {
			const result = parseRulePath("owner/rule-name");
			expect(result).toEqual({
				owner: "owner",
				ruleName: "rule-name",
			});
		});

		it("should handle paths with hyphens and underscores", () => {
			const result = parseRulePath("@test-owner_123/my-cool_rule");
			expect(result).toEqual({
				owner: "test-owner_123",
				ruleName: "my-cool_rule",
			});
		});

		it("should return null for invalid paths", () => {
			expect(parseRulePath("invalid")).toEqual({ ruleName: "invalid" });
			expect(parseRulePath("")).toBeNull();
			expect(parseRulePath("owner/rule/extra")).toBeNull();
			expect(parseRulePath("/rule")).toBeNull();
			expect(parseRulePath("owner/")).toBeNull();
		});
	});

	describe("validateRuleOwnership", () => {
		it("should return userId when owner is a user", async () => {
			mockPrisma.user.findUnique.mockResolvedValue({ id: "user_123" });

			const result = await validateRuleOwnership(mockPrisma as any, "testuser");

			expect(result).toEqual({ userId: "user_123" });
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { username: "testuser" },
				select: { id: true },
			});
		});

		it("should return organizationId when owner is an organization", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.organization.findUnique.mockResolvedValue({ id: "org_456" });

			const result = await validateRuleOwnership(mockPrisma as any, "testorg");

			expect(result).toEqual({ organizationId: "org_456" });
			expect(mockPrisma.organization.findUnique).toHaveBeenCalledWith({
				where: { name: "testorg" },
				select: { id: true },
			});
		});

		it("should throw NOT_FOUND error when owner doesn't exist", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.organization.findUnique.mockResolvedValue(null);

			await expect(validateRuleOwnership(mockPrisma as any, "nonexistent")).rejects.toThrow(
				ORPCError,
			);

			try {
				await validateRuleOwnership(mockPrisma as any, "nonexistent");
			} catch (error) {
				expect(error).toBeInstanceOf(ORPCError);
				expect((error as ORPCError<any, any>).code).toBe("NOT_FOUND");
				expect((error as ORPCError<any, any>).message).toBe("Owner 'nonexistent' not found");
			}
		});

		it("should check user before organization", async () => {
			mockPrisma.user.findUnique.mockResolvedValue({ id: "user_123" });
			mockPrisma.organization.findUnique.mockResolvedValue({ id: "org_456" });

			const result = await validateRuleOwnership(mockPrisma as any, "ambiguous");

			expect(result).toEqual({ userId: "user_123" });
			expect(mockPrisma.organization.findUnique).not.toHaveBeenCalled();
		});
	});

	describe("checkNamespaceAvailable", () => {
		it("should return false when username exists", async () => {
			mockPrisma.user.findUnique.mockResolvedValue({ id: "user_123" });

			const result = await checkNamespaceAvailable(mockPrisma as any, "taken");

			expect(result).toBe(false);
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { username: "taken" },
				select: { id: true },
			});
			expect(mockPrisma.organization.findUnique).not.toHaveBeenCalled();
		});

		it("should return false when organization name exists", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.organization.findUnique.mockResolvedValue({ id: "org_456" });

			const result = await checkNamespaceAvailable(mockPrisma as any, "taken");

			expect(result).toBe(false);
			expect(mockPrisma.organization.findUnique).toHaveBeenCalledWith({
				where: { name: "taken" },
				select: { id: true },
			});
		});

		it("should return true when namespace is available", async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.organization.findUnique.mockResolvedValue(null);

			const result = await checkNamespaceAvailable(mockPrisma as any, "available");

			expect(result).toBe(true);
			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { username: "available" },
				select: { id: true },
			});
			expect(mockPrisma.organization.findUnique).toHaveBeenCalledWith({
				where: { name: "available" },
				select: { id: true },
			});
		});
	});
});
