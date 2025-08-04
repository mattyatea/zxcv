import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import type { contract } from "~/server/orpc/contracts";

declare module "#app" {
	interface NuxtApp {
		$rpc: JsonifiedClient<ContractRouterClient<typeof contract>>;
	}
}

declare module "@vue/runtime-core" {
	interface ComponentCustomProperties {
		$rpc: JsonifiedClient<ContractRouterClient<typeof contract>>;
	}
}

declare module "nuxt/dist/app/nuxt" {
	interface NuxtApp {
		$rpc: JsonifiedClient<ContractRouterClient<typeof contract>>;
	}
}

export {};