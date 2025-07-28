/// <reference types="@nuxt/types" />

import type { createORPCClient } from "@orpc/client";
import type { Router } from "~/server/orpc/router";

declare module "@nuxt/types" {
	interface NuxtApp {
		$rpc: ReturnType<typeof createORPCClient<Router>>;
	}
}

declare module "nuxt/dist/app/nuxt" {
	interface NuxtApp {
		$rpc: ReturnType<typeof createORPCClient<Router>>;
	}
}
