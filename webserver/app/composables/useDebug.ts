export const useDebug = () => {
	const config = useRuntimeConfig();
	const isDebugMode = ref(false);

	onMounted(() => {
		// 開発環境でのみデバッグモードを有効化
		isDebugMode.value = process.dev && localStorage.getItem("debugMode") === "true";
	});

	const toggleDebugMode = () => {
		if (!process.dev) {
			return;
		}
		isDebugMode.value = !isDebugMode.value;
		localStorage.setItem("debugMode", isDebugMode.value.toString());
	};

	const debugLog = (label: string, data: unknown) => {
		if (!isDebugMode.value) {
			return;
		}

		const timestamp = new Date().toISOString();
		console.group(`🔍 [DEBUG ${timestamp}] ${label}`);
		console.log(data);
		console.groupEnd();
	};

	const debugError = (label: string, error: unknown) => {
		if (!isDebugMode.value) {
			return;
		}

		const timestamp = new Date().toISOString();
		console.group(`❌ [DEBUG ERROR ${timestamp}] ${label}`);
		console.error(error);
		console.groupEnd();
	};

	const debugRequest = (method: string, path: string, data?: unknown) => {
		if (!isDebugMode.value) {
			return;
		}

		const timestamp = new Date().toISOString();
		console.group(`📡 [DEBUG REQUEST ${timestamp}] ${method} ${path}`);
		if (data) {
			console.log("Request data:", data);
		}
		console.groupEnd();
	};

	const debugResponse = (method: string, path: string, status: number, data?: unknown) => {
		if (!isDebugMode.value) {
			return;
		}

		const timestamp = new Date().toISOString();
		const statusEmoji = status >= 200 && status < 300 ? "✅" : "⚠️";
		console.group(`${statusEmoji} [DEBUG RESPONSE ${timestamp}] ${method} ${path} - ${status}`);
		if (data) {
			console.log("Response data:", data);
		}
		console.groupEnd();
	};

	return {
		isDebugMode: readonly(isDebugMode),
		toggleDebugMode,
		debugLog,
		debugError,
		debugRequest,
		debugResponse,
	};
};
