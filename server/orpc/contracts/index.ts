import { authContract } from "./auth";
import { healthContract } from "./health";
import { organizationsContract } from "./organizations";
import { rulesContract } from "./rules";
import { usersContract } from "./users";

// すべてのcontractを一つにまとめる
export const contract = {
	auth: authContract,
	health: healthContract,
	rules: rulesContract,
	users: usersContract,
	organizations: organizationsContract,
};