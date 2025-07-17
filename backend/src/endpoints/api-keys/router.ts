import { fromHono } from "chanfana";
import { Hono } from "hono";
import { requireAuth, requireEmailVerification } from "../../middleware/auth";
import { CreateApiKeyEndpoint } from "./createApiKey";
import { DeleteApiKeyEndpoint } from "./deleteApiKey";
import { GetApiKeysEndpoint } from "./getApiKeys";
import { UpdateApiKeyEndpoint } from "./updateApiKey";

export const apiKeysRouter = fromHono(new Hono());

// Apply authentication and email verification middleware to all API key routes
apiKeysRouter.use("*", requireAuth, requireEmailVerification);

apiKeysRouter.post("/", CreateApiKeyEndpoint);
apiKeysRouter.get("/", GetApiKeysEndpoint);
apiKeysRouter.delete("/:id", DeleteApiKeyEndpoint);
apiKeysRouter.put("/:id", UpdateApiKeyEndpoint);
