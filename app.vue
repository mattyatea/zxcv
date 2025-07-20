<template>
  <div :class="{ 'theme-transition': themeTransition }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useThemeStore } from '~/stores/theme';

const themeStore = useThemeStore();
const themeTransition = ref(false);

// Enable theme transition after initial load
onMounted(() => {
  setTimeout(() => {
    themeTransition.value = true;
  }, 100);
});
</script>
