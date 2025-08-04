<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24">
      <div class="container-lg">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {{ $t('about.hero.title') }}
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {{ $t('about.hero.subtitle') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-16 sm:py-20">
      <div class="container-lg">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {{ $t('about.mission.title') }}
          </h2>
          <div class="prose prose-lg dark:prose-invert mx-auto">
            <p>
              {{ $t('about.mission.content1') }}
            </p>
            <p>
              {{ $t('about.mission.content2') }}
            </p>
            <p>
              {{ $t('about.mission.content3') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-16 sm:py-20 bg-gray-50 dark:bg-gray-950">
      <div class="container-lg">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          {{ $t('about.values.title') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="(value, index) in values" 
            :key="index"
            class="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <component :is="value.icon" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {{ $t(value.titleKey) }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{ $t(value.descriptionKey) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 sm:py-20">
      <div class="container-lg">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {{ $t('about.contact.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {{ $t('about.contact.description') }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@zxcv.app"
              class="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ $t('about.contact.email') }}
            </a>
            <a
              href="https://github.com/yourusername/zxcv"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center px-6 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {{ $t('about.contact.github') }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';

const { t } = useI18n();

// Value icons
const ShareIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.684C18.114 16.062 18 16.518 18 17c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3c.482 0 .938.114 1.342.316m0 0a3 3 0 00-4.684-4.684m4.684 4.684a3 3 0 00-4.684 4.684m-1.342-9.632C12.062 5.886 12.518 6 13 6c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3c0 .482.114.938.316 1.342m0 0a3 3 0 014.684 4.684" />
  </svg>`
};

const ShieldIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>`
};

const LightningIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>`
};

const values = [
  {
    icon: ShareIcon,
    titleKey: 'about.values.openness.title',
    descriptionKey: 'about.values.openness.description'
  },
  {
    icon: ShieldIcon,
    titleKey: 'about.values.security.title',
    descriptionKey: 'about.values.security.description'
  },
  {
    icon: LightningIcon,
    titleKey: 'about.values.efficiency.title',
    descriptionKey: 'about.values.efficiency.description'
  }
];

// SEO
useHead({
  title: t('about.pageTitle'),
  meta: [
    { name: 'description', content: t('about.pageDescription') }
  ]
});
</script>

<style scoped>
.prose p {
  @apply mb-6;
}

.prose p:last-child {
  @apply mb-0;
}
</style>