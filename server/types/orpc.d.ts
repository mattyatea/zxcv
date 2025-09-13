import type { ContractRouterClient } from "@orpc/contract/dist/index";
import type { JsonifiedClient } from "@orpc/openapi-client/dist/index";
import type { contract } from "~/server/orpc/contracts";

// Type alias for the router client
export type ORPCClient = JsonifiedClient<ContractRouterClient<typeof contract>>;

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
