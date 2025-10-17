export const isDebugMode = () => {
	return (
		process.env.NODE_ENV === "development" && process.env.DEBUG_MODE === "true"
	);
};

export const debugLog = (label: string, data: unknown) => {
	if (!isDebugMode()) {
		return;
	}

	const timestamp = new Date().toISOString();
	console.group(`🔍 [DEBUG ${timestamp}] ${label}`);
	console.log(JSON.stringify(data, null, 2));
	console.groupEnd();
};

export const debugError = (label: string, error: unknown) => {
	if (!isDebugMode()) {
		return;
	}

	const timestamp = new Date().toISOString();
	console.group(`❌ [DEBUG ERROR ${timestamp}] ${label}`);
	console.error(error);
	if (error && typeof error === "object" && "stack" in error) {
		console.error("Stack trace:", error.stack);
	}
	console.groupEnd();
};

export const debugRequest = (method: string, path: string, data?: unknown) => {
	if (!isDebugMode()) {
		return;
	}

	const timestamp = new Date().toISOString();
	console.group(`📡 [DEBUG REQUEST ${timestamp}] ${method} ${path}`);
	if (data) {
		console.log("Request data:", JSON.stringify(data, null, 2));
	}
	console.groupEnd();
};

export const debugResponse = (
	method: string,
	path: string,
	status: number,
	data?: unknown,
) => {
	if (!isDebugMode()) {
		return;
	}

	const timestamp = new Date().toISOString();
	const statusEmoji = status >= 200 && status < 300 ? "✅" : "⚠️";
	console.group(
		`${statusEmoji} [DEBUG RESPONSE ${timestamp}] ${method} ${path} - ${status}`,
	);
	if (data) {
		console.log("Response data:", JSON.stringify(data, null, 2));
	}
	console.groupEnd();
};
