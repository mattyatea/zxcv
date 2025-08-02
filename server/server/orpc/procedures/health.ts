import { os } from "../index";

export const check = os.health.check.handler(async () => {
	const timestamp = Date.now();

	return {
		status: "healthy" as const,
		timestamp,
	};
});

export const healthProcedures = {
	check,
};
