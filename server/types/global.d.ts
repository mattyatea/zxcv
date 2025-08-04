/// <reference types="@nuxt/types" />

import type { createORPCClient } from "@orpc/client";
import type { Router } from "~/server/orpc/router";
import type { contract } from "../server/orpc/contracts/index";
import type { JsonifiedClient } from "@orpc/openapi-client";
import type { ContractRouterClient } from "@orpc/contract";

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
