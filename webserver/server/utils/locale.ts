export type Locale = "ja" | "en";

/**
 * Extract locale from Accept-Language header
 * @param acceptLanguage - Accept-Language header value
 * @returns Detected locale or default
 */
export function detectLocaleFromHeader(acceptLanguage?: string | null): Locale {
	if (!acceptLanguage) {
		return "ja"; // Default to Japanese for Japan market
	}

	// Parse Accept-Language header
	// Example: "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7"
	const languages = acceptLanguage
		.split(",")
		.map((lang) => {
			const [locale, qValue] = lang.trim().split(";q=");
			return {
				locale: locale ? locale.toLowerCase() : "",
				quality: qValue ? Number.parseFloat(qValue) : 1.0,
			};
		})
		.sort((a, b) => b.quality - a.quality);

	// Check supported locales
	for (const { locale } of languages) {
		if (locale.startsWith("ja")) {
			return "ja";
		}
		if (locale.startsWith("en")) {
			return "en";
		}
	}

	// Default to Japanese for Japan market
	return "ja";
}

/**
 * Get locale from request context
 * @param request - Request object from Cloudflare Workers
 * @returns Detected locale
 */
export function getLocaleFromRequest(request?: Request): Locale {
	if (!request) {
		return "ja";
	}

	const acceptLanguage = request.headers.get("Accept-Language");
	return detectLocaleFromHeader(acceptLanguage);
}
