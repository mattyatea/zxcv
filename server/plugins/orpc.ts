import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { router } from "~/server/orpc/router";

export default defineNuxtPlugin((_nuxtApp) => {
	const requestURL = useRequestURL();

	// SSRとクライアントで適切なURLを構築
	const baseURL = process.server
		? `${requestURL.protocol}//${requestURL.host}`
		: window.location.origin;

	// Use standard oRPC link for RPC protocol
	// Separate endpoints: /rpc for oRPC protocol, /api for REST/OpenAPI
	const link = new RPCLink({
		url: `${baseURL}/rpc`,
		headers: () => {
			const token = import.meta.client ? localStorage.getItem("access_token") : null;
			return token ? { Authorization: `Bearer ${token}` } : {};
		},
		fetch: async (url, options) => {
			const response = await fetch(url, options);

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
				if (process.client) {
					// 認証エラーまたはユーザー不在エラーの場合
					const errorData = data as { message?: string };
					if (
						response.status === 401 ||
						(response.status === 500 && errorData?.message?.includes("User not found")) ||
						(response.status === 500 &&
							errorData?.message?.includes("FOREIGN KEY constraint failed"))
					) {
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

	const rpcClient: RouterClient<typeof router> = createORPCClient(link);

	return {
		provide: {
			rpc: rpcClient,
		},
	};
});
