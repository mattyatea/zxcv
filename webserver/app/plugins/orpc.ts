import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { contract } from "../../server/orpc/contracts";

export default defineNuxtPlugin((_nuxtApp) => {
	const requestURL = useRequestURL();

	// SSRとクライアントで適切なURLを構築
	const baseURL = import.meta.server
		? `${requestURL.protocol}//${requestURL.host}`
		: window.location.origin;

	// Create OpenAPI Link
	const openAPILink = new OpenAPILink(contract, {
		url: `${baseURL}/api`,
		headers: () => {
			const token = import.meta.client
				? localStorage.getItem("access_token")
				: null;
			return token ? { Authorization: `Bearer ${token}` } : {};
		},
		fetch: async (request, init) => {
			const response = await fetch(request, init);

			// レスポンスのクローンを作成してボディを読む
			const clonedResponse = response.clone();
			const text = await clonedResponse.text();
			let data: unknown;

			try {
				data = JSON.parse(text);
			} catch {
				// JSONパースエラーの場合はそのまま返す
				return response;
			}

			// エラーレスポンスの場合
			if (!response.ok) {
				// クライアントサイドでのみ実行
				if (import.meta.client) {
					// 認証エラーの場合のみ処理
					if (response.status === 401) {
						console.log("Authentication error detected, clearing auth data...");
						localStorage.removeItem("access_token");
						localStorage.removeItem("refresh_token");
						localStorage.removeItem("user");

						const route = useRoute();
						if (route.path !== "/login" && route.path !== "/register") {
							navigateTo("/login");
						}
					}
				}
			}

			return response;
		},
	});

	const rpcClient: JsonifiedClient<ContractRouterClient<typeof contract>> =
		createORPCClient(openAPILink);

	return {
		provide: {
			rpc: rpcClient,
		},
	};
});
