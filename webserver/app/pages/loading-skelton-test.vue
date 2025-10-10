<script setup lang="ts">

</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="skeleton h-10 w-2/3 mb-4"></div>
    <div class="flex items-center gap-4">
      <div class="skeleton h-6 w-1/12 mb-8"></div>
      <div class="skeleton h-6 w-1/12 mb-8"></div>
      <div class="skeleton h-6 w-1/12 mb-8"></div>
    </div>
    <div class="flex items-center gap-4">
    <div class="skeleton h-6 w-1/12 mb-8"></div>
    <div class="skeleton h-6 w-1/12 mb-8"></div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="i in 6" :key="i" class="card">
        <div class="skeleton h-6 w-3/4 mb-3"></div>
        <div class="skeleton h-4 w-1/2 mb-4"></div>
        <div class="space-y-2 mb-4">
          <div class="skeleton h-3 w-full"></div>
          <div class="skeleton h-3 w-4/5"></div>
          <div class="skeleton h-3 w-3/5"></div>
        </div>
        <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="skeleton h-5 w-20"></div>
          <div class="skeleton h-5 w-16"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-4xl mx-auto">
    <div class="skeleton h-10 w-2/3 mb-4"></div>
    <div class="skeleton h-6 w-1/3 mb-8"></div>
    <div class="card">
      <div class="skeleton h-4 w-full mb-2"></div>
      <div class="skeleton h-4 w-3/4 mb-2"></div>
      <div class="skeleton h-4 w-1/2"></div>
    </div>
  </div>
</template>

<style scoped>

</style>