import { adminContract } from "./admin";
import { authContract } from "./auth";
import { healthContract } from "./health";
import { organizationsContract } from "./organizations";
import { rulesContract } from "./rules";
import { usersContract } from "./users";

// すべてのcontractを一つにまとめる
export const contract = {
	admin: adminContract,
	auth: authContract,
	health: healthContract,
	organizations: organizationsContract,
	rules: rulesContract,
	users: usersContract,
};
