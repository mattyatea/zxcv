import { getLocaleFromRequest, type Locale } from "../../utils/locale";
import { os } from "../index";

/**
 * Middleware that automatically detects locale from request headers
 * and adds it to the context for use in procedures
 */
export const localeMiddleware = os.middleware(async ({ context, next }) => {
	const request = context.cloudflare?.request;
	const locale = getLocaleFromRequest(request);

	return next({
		context: {
			...context,
			locale,
		},
	});
});

// Export locale type for use in other files
export type { Locale };
