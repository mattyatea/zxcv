import { fromHono } from "chanfana";
import { Hono } from "hono";
import { ChangeVisibilityEndpoint } from "./changeVisibility";
import { CopyRuleEndpoint } from "./copyRule";
import { CreateRuleEndpoint } from "./createRule";
import { DeleteRuleEndpoint } from "./deleteRule";
import { DiffVersionsEndpoint } from "./diffVersions";
import { DownloadRuleEndpoint } from "./downloadRule";
import { GetOrgRuleEndpoint } from "./getOrgRule";
import { GetRuleEndpoint } from "./getRule";
import { GetSpecificVersionEndpoint } from "./getSpecificVersion";
import { GetVersionsEndpoint } from "./getVersions";
import { PublishRuleEndpoint } from "./publishRule";
import { SearchRulesEndpoint } from "./searchRules";
import { StarRuleEndpoint } from "./starRule";
import { UpdateRuleEndpoint } from "./updateRule";

export const rulesRouter = fromHono(new Hono());

// Search rules
rulesRouter.get("/search", SearchRulesEndpoint);

// Create a new rule
rulesRouter.post("/", CreateRuleEndpoint);

// Get organization rule - must come before /:rulename to match correctly
// The @ is part of the URL path, not the parameter
rulesRouter.get("/@:org/:rulename", GetOrgRuleEndpoint);

// Get rule by name
rulesRouter.get("/:rulename", GetRuleEndpoint);

// Update rule
rulesRouter.put("/:id", UpdateRuleEndpoint);

// Delete rule
rulesRouter.delete("/:id", DeleteRuleEndpoint);

// Publish/change visibility
rulesRouter.post("/:id/publish", PublishRuleEndpoint);
rulesRouter.put("/:id/visibility", ChangeVisibilityEndpoint);

// Star/unstar rule
rulesRouter.post("/:id/star", StarRuleEndpoint);

// Download rule
rulesRouter.get("/:id/download", DownloadRuleEndpoint);

// Copy rule
rulesRouter.post("/:id/copy", CopyRuleEndpoint);

// Version management
rulesRouter.get("/:id/versions", GetVersionsEndpoint);
rulesRouter.get("/:id/versions/:version", GetSpecificVersionEndpoint);
rulesRouter.get("/:id/diff", DiffVersionsEndpoint);
