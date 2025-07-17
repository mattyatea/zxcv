import { fromHono } from "chanfana";
import { Hono } from "hono";
import { AddTeamMemberEndpoint } from "./addMember";
import { CreateTeamEndpoint } from "./createTeam";
import { DeleteTeamEndpoint } from "./deleteTeam";
import { GetTeamEndpoint } from "./getTeam";
import { GetTeamsEndpoint } from "./getTeams";
import { RemoveTeamMemberEndpoint } from "./removeMember";
import { UpdateTeamMemberEndpoint } from "./updateMember";
import { UpdateTeamEndpoint } from "./updateTeam";

export const teamsRouter = fromHono(new Hono());

teamsRouter.post("/", CreateTeamEndpoint);
teamsRouter.get("/", GetTeamsEndpoint);
teamsRouter.get("/:id", GetTeamEndpoint);
teamsRouter.put("/:id", UpdateTeamEndpoint);
teamsRouter.delete("/:id", DeleteTeamEndpoint);

// Team member management
teamsRouter.post("/:id/members", AddTeamMemberEndpoint);
teamsRouter.delete("/:id/members/:userId", RemoveTeamMemberEndpoint);
teamsRouter.put("/:id/members/:userId", UpdateTeamMemberEndpoint);
