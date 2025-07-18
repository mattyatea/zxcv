<template>
  <div>
    <!-- Hero section -->
    <div class="bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Share Coding Rules
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Create, share, and manage coding standards with your team. Keep everyone on the same page with ZXCV.
          </p>
          <div class="mt-8 flex justify-center space-x-4">
            <NuxtLink to="/rules" class="btn btn-primary text-lg px-8 py-3">
              Browse Rules
            </NuxtLink>
            <NuxtLink to="/register" class="btn btn-secondary text-lg px-8 py-3">
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Features section -->
    <div class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
            Everything you need for code consistency
          </h2>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div class="card">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Version Control</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              Track changes to your coding rules over time with built-in version control.
            </p>
          </div>

          <div class="card">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Team Collaboration</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              Work together with your team to maintain consistent coding standards.
            </p>
          </div>

          <div class="card">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Easy Export</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              Export your rules in various formats including ESLint, Prettier, and more.
            </p>
          </div>

          <div class="card">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Powerful Search</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              Find the rules you need quickly with tags, categories, and full-text search.
            </p>
          </div>

          <div class="card">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Access Control</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              Control who can view and edit your rules with flexible permission settings.
            </p>
          </div>

          <div class="card">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">API Access</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              Integrate with your CI/CD pipeline using our comprehensive API.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA section -->
    <div class="bg-blue-600 dark:bg-blue-700">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span class="block">Ready to get started?</span>
          <span class="block text-blue-200">Create your first rule today.</span>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <NuxtLink
              to="/register"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'ZXCV - Coding Rules Platform'
})
</script>