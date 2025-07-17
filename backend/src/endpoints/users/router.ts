import { fromHono } from "chanfana";
import { Hono } from "hono";
import { GetProfileEndpoint } from "./getProfile";
import { GetSettingsEndpoint } from "./getSettings";
import { UpdateProfileEndpoint } from "./updateProfile";
import { UpdateSettingsEndpoint } from "./updateSettings";

export const usersRouter = fromHono(new Hono());

usersRouter.get("/me", GetProfileEndpoint);
usersRouter.put("/me", UpdateProfileEndpoint);
usersRouter.get("/me/settings", GetSettingsEndpoint);
usersRouter.put("/me/settings", UpdateSettingsEndpoint);
