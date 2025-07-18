import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
	const startTime = Date.now();

	return {
		status: "healthy",
		timestamp: startTime
	};
});