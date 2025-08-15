import { useI18nStore } from "../stores/i18n";
import { useSettingsStore } from "../stores/settings";

export default defineNuxtPlugin(() => {
	const settingsStore = useSettingsStore();
	const i18nStore = useI18nStore();

	// Initialize i18n locale from settings store
	if (settingsStore.language) {
		i18nStore.setLocale(settingsStore.language as "ja" | "en");
	}
});
