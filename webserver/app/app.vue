<template>
  <div :class="{ 'theme-transition': themeTransition }">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useI18n } from "~/composables/useI18n";
import { useSettingsStore } from "~/stores/settings";

const settingsStore = useSettingsStore();
const { locale, setLocale } = useI18n();
const themeTransition = ref(false);

// Enable theme transition after initial load
onMounted(() => {
	setTimeout(() => {
		themeTransition.value = true;
	}, 100);

	// Initialize settings from localStorage
	settingsStore.initializeSettings();

	// Apply saved language preference
	const savedLanguage =
		settingsStore.language || localStorage.getItem("zxcv-language");
	if (savedLanguage && savedLanguage !== locale) {
		setLocale(savedLanguage);
	}
});
</script>
