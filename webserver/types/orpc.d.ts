import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import type { contract } from "~/server/orpc/contracts";

// Canonical ORPC client type for the frontend
export type ORPCClient = JsonifiedClient<ContractRouterClient<typeof contract>>;
