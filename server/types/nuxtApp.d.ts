import type { RouterClient } from "@orpc/server";
import type { router } from "~/server/orpc/router";

// Type alias for the router client
export type ORPCClient = RouterClient<typeof router>;

declare module "#app" {
	interface NuxtApp {
		$rpc: ORPCClient;
	}
}

declare module "vue" {
	interface ComponentCustomProperties {
		$rpc: ORPCClient;
	}
}
