/// <reference types="@nuxt/types" />

import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import type { contract } from "../server/orpc/contracts/index";

declare module "@nuxt/types" {
	interface NuxtApp {
		$rpc: JsonifiedClient<ContractRouterClient<typeof contract>>;
	}
}

declare module "nuxt/dist/app/nuxt" {
	interface NuxtApp {
		$rpc: JsonifiedClient<ContractRouterClient<typeof contract>>;
	}
}
