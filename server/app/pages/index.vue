<template>
  <div>
    <!-- Hero section -->
    <div class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 dark:from-black dark:via-primary-950 dark:to-black">
      <!-- Animated gradient background -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -inset-[10px] opacity-50">
          <div class="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div class="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>
      </div>
      
      <!-- Grid overlay -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900 opacity-50" />
      
      <div class="relative z-10 container-lg py-32">
        <div class="text-center space-y-8">
          <!-- Main heading with gradient text -->
          <h1 class="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight animate-fade-in-up">
            <span class="block text-white mb-4">{{ $t('home.hero.title') }}</span>
            <span class="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
              {{ $t('home.hero.titleHighlight') }}
            </span>
          </h1>
          
          <!-- Description -->
          <p class="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed animate-fade-in-up animation-delay-200">
            {{ $t('home.hero.description') }}
          </p>
          
          <!-- CTA buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-fade-in-up animation-delay-400">
            <CommonButton
              :tag="NuxtLink"
              to="/rules"
              size="xl"
              class="group relative inline-flex items-center px-8 py-4 overflow-hidden font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span class="relative z-10 flex items-center">
                {{ $t('home.hero.viewRules') }}
                <svg class="w-5 h-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </CommonButton>
            
            <CommonButton
              :tag="NuxtLink"
              to="/register"
              size="xl"
              class="group relative px-8 py-4 font-bold text-white border-2 border-white/30 rounded-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {{ $t('home.hero.getStarted') }}
            </CommonButton>
          </div>
        </div>
      </div>
      
      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>

    <!-- Features section -->
    <div class="py-24 sm:py-32 lg:py-40 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 dark:bg-primary-800/20 rounded-full blur-3xl" />
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200/20 dark:bg-accent-800/20 rounded-full blur-3xl" />
      </div>
      <div class="container-lg">
        <div class="text-center relative z-10 max-w-4xl mx-auto">
          <h2 class="inline-block text-sm font-bold text-transparent bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text uppercase tracking-widest">
            {{ $t('home.features.title') }}
          </h2>
          <h3 class="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white">
            {{ $t('home.features.subtitle') }}
          </h3>
          <p class="mt-8 text-xl sm:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ $t('home.features.description') }}
          </p>
        </div>

        <div class="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
          <!-- Version Control Feature -->
          <div class="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-800">
            <div class="absolute inset-0 bg-gradient-to-r from-primary-600/0 via-primary-600/5 to-primary-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <div class="relative">
              <div class="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                {{ $t('home.features.versionControl.title') }}
              </h3>
              <p class="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                {{ $t('home.features.versionControl.description') }}
              </p>
              <div class="mt-6 inline-flex items-center text-primary-600 dark:text-primary-400 font-medium group-hover:gap-2 transition-all duration-300">
                <span>Learn more</span>
                <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Organization Collaboration Feature -->
          <div class="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-800">
            <div class="absolute inset-0 bg-gradient-to-r from-accent-600/0 via-accent-600/5 to-accent-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <div class="relative">
              <div class="inline-flex p-3 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-lg group-hover:shadow-accent-500/25 transition-all duration-300">
                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                {{ $t('home.features.organizationCollaboration.title') }}
              </h3>
              <p class="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                {{ $t('home.features.organizationCollaboration.description') }}
              </p>
              <div class="mt-6 inline-flex items-center text-accent-600 dark:text-accent-400 font-medium group-hover:gap-2 transition-all duration-300">
                <span>Learn more</span>
                <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Search Feature -->
          <div class="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-800">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <div class="relative">
              <div class="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                {{ $t('home.features.search.title') }}
              </h3>
              <p class="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                {{ $t('home.features.search.description') }}
              </p>
              <div class="mt-6 inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all duration-300">
                <span>Learn more</span>
                <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA section -->
    <div class="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 animated-gradient">
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
      </div>
      
      <!-- Floating elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse float-animation" />
        <div class="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-700 float-animation" />
        <div class="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse delay-1000 float-animation" />
      </div>
      
      <div class="relative container-lg py-20 sm:py-24 lg:py-32">
        <div class="text-center animate-in slide-up-enter-active">
          <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {{ $t('home.cta.title') }}
          </h2>
          <p class="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-primary-100 leading-relaxed">
            {{ $t('home.cta.description') }}
          </p>
          <div class="mt-12">
            <CommonButton
              :tag="NuxtLink"
              to="/register"
              variant="secondary"
              size="xl"
              class="bg-white text-primary-600 hover:bg-gray-100 hover:scale-105 hover-lift shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold px-12 py-4"
            >
              {{ $t('home.cta.button') }}
            </CommonButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const NuxtLink = resolveComponent("NuxtLink");

useHead({
	title: `zxcv - ${t("footer.tagline")}`,
});
</script>