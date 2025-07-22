<template>
  <div class="relative">
    <button
      @click.stop="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Change language"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span class="hidden sm:inline">{{ currentLocaleName }}</span>
      <svg class="w-4 h-4" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        @click.stop
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 py-1 z-50"
      >
        <button
          v-for="localeItem in availableLocales"
          :key="localeItem.code"
          @click="() => switchLocale(localeItem.code)"
          class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group"
          :class="{
            'text-primary-600 dark:text-primary-400 font-medium': localeItem.code === settingsStore.language,
            'text-gray-700 dark:text-gray-300': localeItem.code !== settingsStore.language
          }"
        >
          <span>{{ localeItem.name }}</span>
          <svg
            v-if="localeItem.code === settingsStore.language"
            class="w-4 h-4 text-primary-600 dark:text-primary-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "~/composables/useI18n";
import { useSettingsStore } from "~/stores/settings";

const { locale, availableLocales, setLocale, t } = useI18n();
const settingsStore = useSettingsStore();
const isOpen = ref(false);

const currentLocaleName = computed(() => {
	const current = availableLocales.find((loc) => loc.code === settingsStore.language);
	return current?.name || settingsStore.language;
});

const switchLocale = async (code: string) => {
	setLocale(code as "ja" | "en");
	settingsStore.setLanguage(code);
	localStorage.setItem("zxcv-language", code);
	isOpen.value = false;
};

// Sync store with locale changes
watch(
	() => locale,
	(newLocale) => {
		if (newLocale !== settingsStore.language) {
			settingsStore.setLanguage(newLocale);
		}
	},
);

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
	const target = event.target as HTMLElement;
	if (!target.closest(".relative")) {
		isOpen.value = false;
	}
};

onMounted(() => {
	document.addEventListener("click", handleClickOutside);

	// Initialize locale from saved language
	const savedLanguage = settingsStore.language;
	if (savedLanguage && savedLanguage !== locale) {
		setLocale(savedLanguage as "ja" | "en");
	}
});

onUnmounted(() => {
	document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>