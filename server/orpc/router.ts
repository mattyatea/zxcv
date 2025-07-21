import type { RouterClient } from "@orpc/server";
import { authProcedures } from "~/server/orpc/procedures/auth";
import { healthProcedures } from "~/server/orpc/procedures/health";
import { organizationsProcedures } from "~/server/orpc/procedures/organizations";
import { rulesProcedures } from "~/server/orpc/procedures/rules";
import { usersProcedures } from "~/server/orpc/procedures/users";

export const router = {
	auth: authProcedures,
	rules: rulesProcedures,
	organizations: organizationsProcedures,
	users: usersProcedures,
	health: healthProcedures,
};

export type Router = RouterClient<typeof router>;
