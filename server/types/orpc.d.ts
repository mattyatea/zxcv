import type { RouterClient } from "@orpc/server";
import type { router } from "~/server/orpc/router";

// Type alias for the router client
export type ORPCClient = RouterClient<typeof router>;

// Augment both NuxtApp and Vue ComponentCustomProperties
declare module "#app" {
	interface NuxtApp {
		$rpc: ORPCClient;
	}
}

declare module "@vue/runtime-core" {
	interface ComponentCustomProperties {
		$rpc: ORPCClient;
	}
}

// Also augment the older Vue module format for better compatibility
declare module "vue" {
	interface ComponentCustomProperties {
		$rpc: ORPCClient;
	}
}
