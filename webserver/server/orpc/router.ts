import { implement } from "@orpc/server";
import { contract } from "./contracts";
import { adminProcedures } from "./procedures/admin";
import { authProcedures } from "./procedures/auth";
import { healthProcedures } from "./procedures/health";
import { organizationsProcedures } from "./procedures/organizations";
import { reportsProcedures } from "./procedures/reports";
import { rulesProcedures } from "./procedures/rules";
import { usersProcedures } from "./procedures/users";
import type { Context } from "./types";

const baseOs = implement(contract);
const os = baseOs.$context<Context>();

export const router = os.router({
	admin: adminProcedures,
	auth: authProcedures,
	rules: rulesProcedures,
	organizations: organizationsProcedures,
	reports: reportsProcedures,
	users: usersProcedures,
	health: healthProcedures,
});
