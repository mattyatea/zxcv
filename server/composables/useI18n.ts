import { type Locale, useI18nStore } from "~/stores/i18n";

interface PluralRule {
	zero?: string;
	one?: string;
	few?: string;
	many?: string;
	other: string;
}

export function useI18n() {
	const store = useI18nStore();
	const route = useRoute();
	const headers = useRequestHeaders();

	// Detect locale from browser
	const detectBrowserLocale = (): Locale => {
		// Check SSR headers first
		if (import.meta.server && headers["accept-language"]) {
			const acceptLanguage = headers["accept-language"];
			if (acceptLanguage.startsWith("ja")) {
				return "ja";
			}
			if (acceptLanguage.startsWith("en")) {
				return "en";
			}
		}

		// Check browser language on client
		if (import.meta.client && typeof navigator !== "undefined") {
			const browserLang = navigator.language.toLowerCase();
			if (browserLang.startsWith("ja")) {
				return "ja";
			}
			if (browserLang.startsWith("en")) {
				return "en";
			}
		}

		// Default to Japanese for Japan market
		return "ja";
	};

	// Initialize locale based on various sources
	const initLocale = (savedLocale?: Locale) => {
		// Priority: saved locale > query param > browser detection
		if (savedLocale && (savedLocale === "ja" || savedLocale === "en")) {
			store.setLocale(savedLocale);
			return;
		}

		// Check query parameter
		const queryLocale = route.query.lang as string;
		if (queryLocale === "ja" || queryLocale === "en") {
			store.setLocale(queryLocale);
			return;
		}

		// Detect from browser
		const detectedLocale = detectBrowserLocale();
		store.setLocale(detectedLocale);
	};

	// Plural support for future use
	const tp = (key: string, count: number, params?: Record<string, string | number>): string => {
		// Basic plural logic - can be extended with proper plural rules
		const pluralKey = count === 0 ? `${key}.zero` : count === 1 ? `${key}.one` : `${key}.other`;

		// Try plural form first, fallback to base key
		let translation = store.t(pluralKey, { count, ...params });
		if (translation.startsWith("[") && translation.endsWith("]")) {
			// Fallback to base key if plural form not found
			translation = store.t(key, { count, ...params });
		}

		return translation;
	};

	// Format number based on locale
	const formatNumber = (value: number): string => {
		const locale = store.locale === "ja" ? "ja-JP" : "en-US";
		return new Intl.NumberFormat(locale).format(value);
	};

	// Format date based on locale
	const formatDate = (date: Date | string | number, format: "short" | "long" = "short"): string => {
		const locale = store.locale === "ja" ? "ja-JP" : "en-US";
		const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;

		const options: Intl.DateTimeFormatOptions =
			format === "short"
				? { year: "numeric", month: "2-digit", day: "2-digit" }
				: { year: "numeric", month: "long", day: "numeric", weekday: "long" };

		return new Intl.DateTimeFormat(locale, options).format(d);
	};

	// Check if current locale is RTL (for future Arabic support etc)
	const isRTL = computed(() => {
		// Currently only supporting LTR languages
		return false;
	});

	return {
		t: store.t,
		tp, // Plural translation
		locale: computed(() => store.locale),
		setLocale: store.setLocale,
		availableLocales: computed(() => store.availableLocales),
		detectBrowserLocale,
		initLocale,
		formatNumber,
		formatDate,
		isRTL,
	};
}
