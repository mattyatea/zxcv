<template>
  <div class="card animate-pulse">
    <!-- ヘッダー：アバターとロールバッジ -->
    <div class="flex items-start justify-between mb-4">
      <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
    </div>
    
    <!-- 組織名 -->
    <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    
    <!-- 説明文 -->
    <div class="space-y-2 mb-4">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
    
    <!-- 統計情報 -->
    <div class="flex items-center space-x-4">
      <div class="flex items-center gap-1">
        <div class="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 組織カードのスケルトンローディングコンポーネント
</script>