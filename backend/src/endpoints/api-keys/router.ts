import { fromHono } from "chanfana";
import { Hono } from "hono";
import { CreateApiKeyEndpoint } from "./createApiKey";
import { DeleteApiKeyEndpoint } from "./deleteApiKey";
import { GetApiKeysEndpoint } from "./getApiKeys";
import { UpdateApiKeyEndpoint } from "./updateApiKey";

export const apiKeysRouter = fromHono(new Hono());

apiKeysRouter.post("/", CreateApiKeyEndpoint);
apiKeysRouter.get("/", GetApiKeysEndpoint);
apiKeysRouter.delete("/:id", DeleteApiKeyEndpoint);
apiKeysRouter.put("/:id", UpdateApiKeyEndpoint);
