import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { handlePrismaError } from "~/server/utils/prismaErrors";

describe("handlePrismaError", () => {
	describe("PrismaClientKnownRequestError", () => {
		it("should handle P2002 unique constraint violation", () => {
			const error = new Prisma.PrismaClientKnownRequestError(
				"Unique constraint failed",
				{
					code: "P2002",
					clientVersion: "5.0.0",
					meta: { target: ["email", "username"] },
				},
			);

			const result = handlePrismaError(error);

			expect(result).toEqual({
				status: 409,
				message: "A record with this email, username already exists",
			});
		});

		it("should handle P2002 without target meta", () => {
			const error = new Prisma.PrismaClientKnownRequestError(
				"Unique constraint failed",
				{
					code: "P2002",
					clientVersion: "5.0.0",
				},
			);

			const result = handlePrismaError(error);

			expect(result).toEqual({
				status: 409,
				message: "A record with this value already exists",
			});
		});

		it("should handle P2025 record not found", () => {
			const error = new Prisma.PrismaClientKnownRequestError(
				"Record to update not found",
				{
					code: "P2025",
					clientVersion: "5.0.0",
				},
			);

			const result = handlePrismaError(error);

			expect(result).toEqual({
				status: 404,
				message: "Record not found",
			});
		});

		it("should handle P2003 foreign key constraint violation", () => {
			const error = new Prisma.PrismaClientKnownRequestError(
				"Foreign key constraint failed",
				{
					code: "P2003",
					clientVersion: "5.0.0",
				},
			);

			const result = handlePrismaError(error);

			expect(result).toEqual({
				status: 400,
				message: "Related record not found",
			});
		});

		it("should handle P2011 null constraint violation", () => {
			const error = new Prisma.PrismaClientKnownRequestError(
				"Null constraint violation",
				{
					code: "P2011",
					clientVersion: "5.0.0",
				},
			);

			const result = handlePrismaError(error);

			expect(result).toEqual({
				status: 400,
				message: "Required field is missing",
			});
		});

		it("should handle unknown Prisma error codes", () => {
			const error = new Prisma.PrismaClientKnownRequestError(
				"Unknown error",
				{
					code: "P9999",
					clientVersion: "5.0.0",
				},
			);

			const result = handlePrismaError(error);

			expect(result).toEqual({
				status: 400,
				message: "Database operation failed",
			});
		});
	});

	describe("PrismaClientValidationError", () => {
		it("should handle validation errors", () => {
			// Note: PrismaClientValidationError constructor is not easily mockable
			// so we create a minimal mock that extends Error
			class MockValidationError extends Error {
				constructor(message: string) {
					super(message);
					this.name = "PrismaClientValidationError";
				}
			}
			
			// Make it instanceof Prisma.PrismaClientValidationError
			Object.setPrototypeOf(MockValidationError.prototype, Prisma.PrismaClientValidationError.prototype);
			
			const error = new MockValidationError("Invalid data");

			const result = handlePrismaError(error);

			expect(result).toEqual({
				status: 400,
				message: "Invalid request data",
			});
		});
	});

	describe("Unknown errors", () => {
		it("should handle generic Error", () => {
			const error = new Error("Something went wrong");

			const result = handlePrismaError(error);

			expect(result).toEqual({
				status: 500,
				message: "Internal server error",
			});
		});

		it("should handle string errors", () => {
			const result = handlePrismaError("String error");

			expect(result).toEqual({
				status: 500,
				message: "Internal server error",
			});
		});

		it("should handle null/undefined", () => {
			expect(handlePrismaError(null)).toEqual({
				status: 500,
				message: "Internal server error",
			});

			expect(handlePrismaError(undefined)).toEqual({
				status: 500,
				message: "Internal server error",
			});
		});
	});
});