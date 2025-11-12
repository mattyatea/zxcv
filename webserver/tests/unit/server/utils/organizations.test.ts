import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	canDeleteOrganizationRule,
	canEditOrganizationRule,
	canViewOrganizationRule,
	checkOrganizationMembership,
	isOrganizationOwner,
} from "~/server/utils/organizations";

describe("organizations utilities", () => {
	let mockPrisma: {
		organizationMember: {
			findUnique: ReturnType<typeof vi.fn>;
		};
	};

	beforeEach(() => {
		vi.clearAllMocks();

		mockPrisma = {
			organizationMember: {
				findUnique: vi.fn(),
			},
		};
	});

	describe("checkOrganizationMembership", () => {
		it("should return member details when user is a member", async () => {
			const mockMember = {
				id: "member_123",
				organizationId: "org_123",
				userId: "user_123",
				role: "member",
				joinedAt: 1234567890,
			};

			mockPrisma.organizationMember.findUnique.mockResolvedValue(mockMember);

			const result = await checkOrganizationMembership(mockPrisma as any, "user_123", "org_123");

			expect(result).toEqual(mockMember);
			expect(mockPrisma.organizationMember.findUnique).toHaveBeenCalledWith({
				where: {
					organizationId_userId: {
						organizationId: "org_123",
						userId: "user_123",
					},
				},
			});
		});

		it("should return null when user is not a member", async () => {
			mockPrisma.organizationMember.findUnique.mockResolvedValue(null);

			const result = await checkOrganizationMembership(mockPrisma as any, "user_123", "org_123");

			expect(result).toBeNull();
		});

		it("should handle different roles correctly", async () => {
			const roles = ["owner", "admin", "member", "viewer"];

			for (const role of roles) {
				mockPrisma.organizationMember.findUnique.mockResolvedValue({
					id: "member_123",
					organizationId: "org_123",
					userId: "user_123",
					role,
					joinedAt: 1234567890,
				});

				const result = await checkOrganizationMembership(mockPrisma as any, "user_123", "org_123");

				expect(result?.role).toBe(role);
			}
		});
	});

	describe("canViewOrganizationRule", () => {
		it("should return true when user is any type of member", async () => {
			const roles = ["owner", "admin", "member", "viewer"];

			for (const role of roles) {
				mockPrisma.organizationMember.findUnique.mockResolvedValue({
					id: "member_123",
					organizationId: "org_123",
					userId: "user_123",
					role,
					joinedAt: 1234567890,
				});

				const result = await canViewOrganizationRule(mockPrisma as any, "user_123", "org_123");

				expect(result).toBe(true);
			}
		});

		it("should return false when user is not a member", async () => {
			mockPrisma.organizationMember.findUnique.mockResolvedValue(null);

			const result = await canViewOrganizationRule(mockPrisma as any, "user_123", "org_123");

			expect(result).toBe(false);
		});
	});

	describe("canEditOrganizationRule", () => {
		it("should return true for owner, admin, and member roles", async () => {
			const allowedRoles = ["owner", "admin", "member"];

			for (const role of allowedRoles) {
				mockPrisma.organizationMember.findUnique.mockResolvedValue({
					id: "member_123",
					organizationId: "org_123",
					userId: "user_123",
					role,
					joinedAt: 1234567890,
				});

				const result = await canEditOrganizationRule(mockPrisma as any, "user_123", "org_123");

				expect(result).toBe(true);
			}
		});

		it("should return false for viewer role", async () => {
			mockPrisma.organizationMember.findUnique.mockResolvedValue({
				id: "member_123",
				organizationId: "org_123",
				userId: "user_123",
				role: "viewer",
				joinedAt: 1234567890,
			});

			const result = await canEditOrganizationRule(mockPrisma as any, "user_123", "org_123");

			expect(result).toBe(false);
		});

		it("should return false when user is not a member", async () => {
			mockPrisma.organizationMember.findUnique.mockResolvedValue(null);

			const result = await canEditOrganizationRule(mockPrisma as any, "user_123", "org_123");

			expect(result).toBe(false);
		});
	});

	describe("canDeleteOrganizationRule", () => {
		it("should return true for owner and admin roles", async () => {
			const allowedRoles = ["owner", "admin"];

			for (const role of allowedRoles) {
				mockPrisma.organizationMember.findUnique.mockResolvedValue({
					id: "member_123",
					organizationId: "org_123",
					userId: "user_123",
					role,
					joinedAt: 1234567890,
				});

				const result = await canDeleteOrganizationRule(mockPrisma as any, "user_123", "org_123");

				expect(result).toBe(true);
			}
		});

		it("should return false for member and viewer roles", async () => {
			const disallowedRoles = ["member", "viewer"];

			for (const role of disallowedRoles) {
				mockPrisma.organizationMember.findUnique.mockResolvedValue({
					id: "member_123",
					organizationId: "org_123",
					userId: "user_123",
					role,
					joinedAt: 1234567890,
				});

				const result = await canDeleteOrganizationRule(mockPrisma as any, "user_123", "org_123");

				expect(result).toBe(false);
			}
		});

		it("should return false when user is not a member", async () => {
			mockPrisma.organizationMember.findUnique.mockResolvedValue(null);

			const result = await canDeleteOrganizationRule(mockPrisma as any, "user_123", "org_123");

			expect(result).toBe(false);
		});
	});

	describe("isOrganizationOwner", () => {
		it("should return true only for owner role", async () => {
			mockPrisma.organizationMember.findUnique.mockResolvedValue({
				id: "member_123",
				organizationId: "org_123",
				userId: "user_123",
				role: "owner",
				joinedAt: 1234567890,
			});

			const result = await isOrganizationOwner(mockPrisma as any, "user_123", "org_123");

			expect(result).toBe(true);
		});

		it("should return false for non-owner roles", async () => {
			const nonOwnerRoles = ["admin", "member", "viewer"];

			for (const role of nonOwnerRoles) {
				mockPrisma.organizationMember.findUnique.mockResolvedValue({
					id: "member_123",
					organizationId: "org_123",
					userId: "user_123",
					role,
					joinedAt: 1234567890,
				});

				const result = await isOrganizationOwner(mockPrisma as any, "user_123", "org_123");

				expect(result).toBe(false);
			}
		});

		it("should return false when user is not a member", async () => {
			mockPrisma.organizationMember.findUnique.mockResolvedValue(null);

			const result = await isOrganizationOwner(mockPrisma as any, "user_123", "org_123");

			expect(result).toBe(false);
		});
	});
});
