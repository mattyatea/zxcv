<template>
  <div class="max-w-6xl mx-auto animate-pulse">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <!-- メインコンテンツ -->
      <div class="lg:col-span-2">
        <!-- ヘッダー -->
        <div class="mb-10">
          <!-- タイトルとバッジ -->
          <div class="flex items-center gap-4 mb-6">
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
          </div>
          
          <!-- 作成者・バージョン・日付 -->
          <div class="flex flex-wrap items-center gap-6">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          
          <!-- 統計情報 -->
          <div class="flex flex-wrap gap-8 mt-8">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            </div>
          </div>
        </div>

        <!-- 説明カード -->
        <div class="card mb-8">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>

        <!-- ルール内容カード -->
        <div class="card mb-8">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          
          <!-- タブ -->
          <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex gap-4 pb-2">
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
          
          <!-- コンテンツエリア -->
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/6"></div>
          </div>
        </div>

        <!-- バージョン履歴カード -->
        <div class="card">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div class="space-y-4">
            <!-- バージョンアイテム -->
            <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  </div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- サイドバー -->
      <div class="space-y-8">
        <!-- アクションカード -->
        <div class="card">
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-6"></div>
          <div class="space-y-4">
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>

        <!-- CLIコマンドカード -->
        <div class="card">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div class="space-y-4">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-12 bg-gray-800 dark:bg-gray-950 rounded-lg"></div>
          </div>
        </div>

        <!-- タグカード -->
        <div class="card">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div class="flex flex-wrap gap-2">
            <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
            <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
          </div>
        </div>

        <!-- 作成者情報カード -->
        <div class="card">
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-6"></div>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div>
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        </div>

        <!-- 関連ルールカード -->
        <div class="card">
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
          <div class="space-y-4">
            <div class="p-3">
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
              <div class="flex items-center gap-3">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            </div>
            <div class="p-3">
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div class="flex items-center gap-3">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// スケルトンローディングコンポーネント
// ルール詳細ページの実際のレイアウトに完全に一致するように設計
</script>