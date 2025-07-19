import { os } from "~/server/orpc/index";

export const healthProcedures = {
	check: os.handler(async () => {
		const startTime = Date.now();

		return {
			status: "healthy",
			timestamp: startTime,
		};
	}),
};
