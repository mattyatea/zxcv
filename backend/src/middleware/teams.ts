import { ApiException } from "chanfana";
import type { MiddlewareHandler } from "hono";
import type { Env } from "../types/env";
import { createPrismaClient } from "../utils/prisma";
import { checkTeamMembership } from "../utils/teams";
import type { AuthContext } from "./auth";

export interface TeamContext extends AuthContext {
	teamMember?: {
		team_id: string;
		role: "owner" | "admin" | "member" | "viewer";
	};
}

export const requireTeamAccess = (
	action: "view" | "edit" | "delete" = "view",
): MiddlewareHandler<{ Bindings: Env; Variables: TeamContext }> => {
	return async (c, next) => {
		const user = c.get("user");
		if (!user) {
			throw new ApiException("Authentication required");
		}

		// Get team_id from request - could be in body, params, or query
		let teamId: string | undefined;

		// Try to get from route params
		teamId = c.req.param("team_id");

		// Try to get from request body if not in params
		if (!teamId) {
			try {
				const body = await c.req.json();
				teamId = body.team_id;
			} catch {
				// Body might not be JSON
			}
		}

		// Try to get from query params
		if (!teamId) {
			teamId = c.req.query("team_id");
		}

		if (!teamId) {
			throw new ApiException("Team ID is required");
		}

		const prisma = createPrismaClient(c.env.DB);
		const member = await checkTeamMembership(prisma, user.id, teamId);

		if (!member) {
			throw new ApiException("You are not a member of this team");
		}

		// Check permissions based on action
		switch (action) {
			case "view":
				// All members can view
				break;
			case "edit":
				if (member.role === "viewer") {
					throw new ApiException("Insufficient permissions");
				}
				break;
			case "delete":
				if (!["owner", "admin"].includes(member.role)) {
					throw new ApiException("Insufficient permissions");
				}
				break;
		}

		// Set team member info in context
		c.set("teamMember", {
			team_id: member.teamId,
			role: member.role,
		});

		await next();
	};
};
