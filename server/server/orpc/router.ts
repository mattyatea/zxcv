import type { RouterClient } from "@orpc/server";
import { implement } from "@orpc/server";
import { contract } from "~/server/orpc/contracts";
import { authProcedures } from "~/server/orpc/procedures/auth";
import { healthProcedures } from "~/server/orpc/procedures/health";
import { organizationsProcedures } from "~/server/orpc/procedures/organizations";
import { rulesProcedures } from "~/server/orpc/procedures/rules";
import { usersProcedures } from "~/server/orpc/procedures/users";
import type { Context } from "~/server/orpc/types";

const baseOs = implement(contract);
const os = baseOs.$context<Context>();

export const router = os.router({
	auth: authProcedures,
	rules: rulesProcedures,
	organizations: organizationsProcedures,
	users: usersProcedures,
	health: healthProcedures,
});

export type Router = RouterClient<typeof router>;
