<template>
  <div class="animate-pulse">
    <!-- ヘッダー -->
    <div class="flex items-start justify-between mb-8">
      <div class="flex items-center gap-3">
        <!-- アバター -->
        <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div>
          <!-- 組織名 -->
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <!-- 説明文 -->
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
      </div>
      
      <!-- アクションボタン -->
      <div class="h-9 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
    </div>

    <!-- 統計グリッド -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <!-- メンバー数カード -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
          <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      
      <!-- ルール数カード -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
          <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      
      <!-- 作成日カード -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
          <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>

    <!-- タブ -->
    <div class="border-b border-gray-200 dark:border-gray-800 mb-6">
      <div class="flex space-x-8">
        <div class="py-2 px-1">
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div class="py-2 px-1">
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>

    <!-- タブコンテンツ（ルール一覧の場合） -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- ルールカード -->
      <div v-for="i in 6" :key="i" class="card">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
        <div class="flex items-center justify-between">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 組織詳細ページのスケルトンローディングコンポーネント
// 実際のレイアウト構造に完全に一致
</script>