import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import type { contract } from "~/server/orpc/contracts";

export const useRpc = () => {
	const { $rpc } = useNuxtApp();
	return $rpc as JsonifiedClient<ContractRouterClient<typeof contract>>;
};
