import { defineStore } from "pinia";
import enTranslations from "../i18n/locales/en.json";
import jaTranslations from "../i18n/locales/ja.json";

export type Locale = "ja" | "en";

interface Translations {
	[key: string]: string | Translations;
}

const translations: Record<Locale, Translations> = {
	ja: jaTranslations,
	en: enTranslations,
};

export const useI18nStore = defineStore("i18n", () => {
	const locale = ref<Locale>("ja");

	// Note: Locale persistence is handled by the settings store

	// Translation function
	function t(key: string, params?: Record<string, string | number>): string {
		const keys = key.split(".");
		let translation: string | Translations | undefined = translations[locale.value];

		for (const k of keys) {
			if (translation && typeof translation === "object" && k in translation) {
				translation = translation[k] as string | Translations;
			} else {
				// Fallback handling
				if (process.env.NODE_ENV === "development") {
					console.warn(`Translation key not found: ${key} (locale: ${locale.value})`);
				}

				// Try fallback to English if current locale is not English
				if (locale.value !== "en") {
					let fallbackTranslation: string | Translations | undefined = translations.en;
					for (const k of keys) {
						if (
							fallbackTranslation &&
							typeof fallbackTranslation === "object" &&
							k in fallbackTranslation
						) {
							fallbackTranslation = fallbackTranslation[k] as string | Translations;
						} else {
							// Return formatted key if translation not found
							return `[${key}]`;
						}
					}
					if (typeof fallbackTranslation === "string") {
						translation = fallbackTranslation;
						break;
					}
				}

				// Return formatted key if translation not found
				return `[${key}]`;
			}
		}

		if (typeof translation !== "string") {
			return `[${key}]`;
		}

		// Replace parameters if provided
		if (params) {
			return translation.replace(/\{(\w+)\}/g, (match, param) => {
				return params[param]?.toString() || match;
			});
		}

		return translation;
	}

	// Get available locales
	const availableLocales = computed(() => [
		{ code: "ja", name: "日本語" },
		{ code: "en", name: "English" },
	]);

	// Set locale
	function setLocale(newLocale: Locale) {
		locale.value = newLocale;
	}

	return {
		locale: computed(() => locale.value),
		t,
		availableLocales,
		setLocale,
	};
});
