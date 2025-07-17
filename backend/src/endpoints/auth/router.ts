import { fromHono } from "chanfana";
import { Hono } from "hono";
import { ForgotPasswordEndpoint } from "./forgotPassword";
import { LoginEndpoint } from "./login";
import { LogoutEndpoint } from "./logout";
import { RefreshTokenEndpoint } from "./refresh";
import { RegisterEndpoint } from "./register";
import { ResetPasswordEndpoint } from "./resetPassword";
import { SendVerificationRoute } from "./sendVerification";
import { VerifyEmailRoute } from "./verifyEmail";

export const authRouter = fromHono(new Hono());

authRouter.post("/register", RegisterEndpoint);
authRouter.post("/login", LoginEndpoint);
authRouter.post("/logout", LogoutEndpoint);
authRouter.post("/refresh", RefreshTokenEndpoint);
authRouter.post("/forgot-password", ForgotPasswordEndpoint);
authRouter.post("/reset-password", ResetPasswordEndpoint);
authRouter.post("/send-verification", SendVerificationRoute);
authRouter.post("/verify-email", VerifyEmailRoute);
