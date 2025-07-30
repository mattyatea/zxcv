<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <LayoutHeader />
    
    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>
    
    <LayoutFooter />
    
    <!-- Toast notifications -->
    <CommonToast />
  </div>
</template>

<script setup>
// Layout logic is now in separate components
</script>