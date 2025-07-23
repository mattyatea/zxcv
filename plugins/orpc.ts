import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { Router } from "~/server/orpc/router";

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

			// Handle authentication errors
			if (!response.ok && import.meta.client) {
				const clonedResponse = response.clone();
				try {
					const data = (await clonedResponse.json()) as { message?: string };
					if (
						response.status === 401 ||
						(response.status === 500 && data?.message?.includes("User not found")) ||
						(response.status === 500 && data?.message?.includes("FOREIGN KEY constraint failed"))
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
				} catch {
					// Ignore JSON parse errors
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
