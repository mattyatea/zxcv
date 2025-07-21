import type { createORPCClient } from "@orpc/client";
import type { Router } from "../server/orpc/router";

type RPCClient = ReturnType<typeof createORPCClient<Router>>;

declare module "#app" {
	interface NuxtApp {
		$rpc: RPCClient;
	}
}

declare module "vue" {
	interface ComponentCustomProperties {
		$rpc: RPCClient;
	}
}
