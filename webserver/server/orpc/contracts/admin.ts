import { oc } from "@orpc/contract";
import * as z from "zod";

export const adminContract = {
	getModerators: oc
		.route({
			method: "GET",
			path: "/admin/moderators",
			description: "Retrieve the list of users with moderator role",
		})
		.output(
			z.array(
				z.object({
					id: z.string(),
					username: z.string(),
					email: z.string(),
					role: z.string(),
					createdAt: z.number(),
				}),
			),
		),

	assignModerator: oc
		.route({
			method: "POST",
			path: "/admin/assignModerator",
			description: "Assign moderator role to a user",
		})
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				message: z.string(),
			}),
		),

	removeModerator: oc
		.route({
			method: "POST",
			path: "/admin/removeModerator",
			description: "Remove moderator role from a user",
		})
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				message: z.string(),
			}),
		),
};
