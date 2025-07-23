import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { Router } from "~/server/orpc/router";

export default defineNuxtPlugin((_nuxtApp) => {
	const requestURL = useRequestURL();

	// SSRとクライアントで適切なURLを構築
	const baseURL = process.server
		? `${requestURL.protocol}//${requestURL.host}`
		: window.location.origin;
	const link = new RPCLink({
		url: `${baseURL}/api`,
		headers: () => {
			const token = process.client ? localStorage.getItem("access_token") : null;
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

						// トークンをクリア
						localStorage.removeItem("access_token");
						localStorage.removeItem("refresh_token");
						localStorage.removeItem("user");

						// ログインページへリダイレクト
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

	const rpcClient = createORPCClient<Router>(link);

	return {
		provide: {
			rpc: rpcClient,
		},
	};
});
