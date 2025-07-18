import { Prisma } from "@prisma/client";

export function handlePrismaError(error: unknown) {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2002": {
				// Unique constraint violation
				const target = error.meta?.target as string[] | undefined;
				return {
					status: 409 as const,
					message: `A record with this ${target?.join(", ") || "value"} already exists`,
				};
			}

			case "P2025":
				// Record not found
				return {
					status: 404 as const,
					message: "Record not found",
				};

			case "P2003":
				// Foreign key constraint violation
				return {
					status: 400 as const,
					message: "Related record not found",
				};

			case "P2011":
				// Null constraint violation
				return {
					status: 400 as const,
					message: "Required field is missing",
				};

			default:
				return {
					status: 400 as const,
					message: "Database operation failed",
				};
		}
	}

	if (error instanceof Prisma.PrismaClientValidationError) {
		return {
			status: 400 as const,
			message: "Invalid request data",
		};
	}

	return {
		status: 500 as const,
		message: "Internal server error",
	};
}
