import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useSettingsStore = defineStore("settings", () => {
	// State
	const language = ref<string>("ja");
	const theme = ref<"light" | "dark" | "system">("system");

	// Local storage key
	const STORAGE_KEY = "zxcv-settings";

	// Initialize from localStorage
	const initializeSettings = () => {
		if (process.client) {
			const savedSettings = localStorage.getItem(STORAGE_KEY);
			if (savedSettings) {
				try {
					const parsed = JSON.parse(savedSettings);
					if (parsed.language) {
						language.value = parsed.language;
					}
					if (parsed.theme) {
						theme.value = parsed.theme;
					}
				} catch (error) {
					console.error("Failed to parse saved settings:", error);
				}
			}
		}
	};

	// Save to localStorage
	const saveSettings = () => {
		if (process.client) {
			const settings = {
				language: language.value,
				theme: theme.value,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		}
	};

	// Actions
	const setLanguage = (lang: string) => {
		language.value = lang;
		saveSettings();
	};

	const setTheme = (newTheme: "light" | "dark" | "system") => {
		theme.value = newTheme;
		saveSettings();
	};

	// Watch for changes and save
	watch([language, theme], () => {
		saveSettings();
	});

	// Initialize on mount
	initializeSettings();

	return {
		// State
		language,
		theme,

		// Actions
		setLanguage,
		setTheme,
		initializeSettings,
	};
});
