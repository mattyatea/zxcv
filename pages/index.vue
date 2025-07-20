<template>
  <div>
    <!-- Hero section -->
    <div class="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <!-- Background pattern -->
      <div class="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <div class="relative container-lg py-24 sm:py-32">
        <div class="text-center">
          <div class="mb-8 flex justify-center">
            <div class="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 dark:text-gray-400 ring-1 ring-gray-900/10 dark:ring-gray-100/10 hover:ring-gray-900/20 dark:hover:ring-gray-100/20">
              AIコーディングルール管理の新しいスタンダード
              <span class="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-600/20 blur-lg" />
            </div>
          </div>
          
          <h1 class="text-5xl font-black tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
            <span class="block">コーディングルールを</span>
            <span class="block bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">共有・管理・活用</span>
          </h1>
          
          <p class="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            チーム全体でコーディング規約を統一。AIに最適化されたルール管理で、
            開発効率を最大化します。
          </p>
          
          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <CommonButton
              :tag="NuxtLink"
              to="/rules"
              variant="primary"
              size="lg"
              class="group"
            >
              <span>ルールを見る</span>
              <svg class="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </CommonButton>
            <CommonButton
              :tag="NuxtLink"
              to="/register"
              variant="secondary"
              size="lg"
            >
              無料で始める
            </CommonButton>
          </div>
        </div>
        
        <!-- Floating elements -->
        <div class="absolute top-20 left-10 w-20 h-20 bg-primary-500/10 rounded-full blur-xl animate-pulse" />
        <div class="absolute bottom-20 right-10 w-32 h-32 bg-primary-600/10 rounded-full blur-xl animate-pulse delay-700" />
      </div>
    </div>

    <!-- Features section -->
    <div class="py-20 sm:py-24 bg-gray-50/50 dark:bg-gray-900/50">
      <div class="container-lg">
        <div class="text-center">
          <h2 class="text-base font-semibold text-primary-600 dark:text-primary-400">
            FEATURES
          </h2>
          <h3 class="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            チーム開発に必要なすべての機能
          </h3>
          <p class="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            コード品質を保ちながら、開発スピードを向上させる機能を提供
          </p>
        </div>

        <div class="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CommonCard variant="bordered" hover class="group">
            <div class="mb-4 inline-flex p-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">バージョン管理</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              ルールの変更履歴を自動的に記録。いつでも過去のバージョンに戻すことができます。
            </p>
          </CommonCard>

          <CommonCard variant="bordered" hover class="group">
            <div class="mb-4 inline-flex p-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">チーム連携</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              チームメンバーと簡単に共有。権限管理で安全にルールを管理できます。
            </p>
          </CommonCard>

          <CommonCard variant="bordered" hover class="group">
            <div class="mb-4 inline-flex p-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">簡単エクスポート</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              ESLint、Prettier、EditorConfigなど、様々な形式でルールをエクスポート。
            </p>
          </CommonCard>

          <CommonCard variant="bordered" hover class="group">
            <div class="mb-4 inline-flex p-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">高速検索</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              タグ、カテゴリ、全文検索で必要なルールを瞬時に発見。
            </p>
          </CommonCard>

          <CommonCard variant="bordered" hover class="group">
            <div class="mb-4 inline-flex p-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">アクセス制御</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              柔軟な権限設定で、誰が閲覧・編集できるかを細かく制御。
            </p>
          </CommonCard>

          <CommonCard variant="bordered" hover class="group">
            <div class="mb-4 inline-flex p-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">APIアクセス</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              CI/CDパイプラインと連携して、自動化を実現。
            </p>
          </CommonCard>
        </div>
      </div>
    </div>

    <!-- CTA section -->
    <div class="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700">
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
      </div>
      
      <div class="relative container-lg py-16 sm:py-20">
        <div class="text-center">
          <h2 class="text-3xl sm:text-4xl font-bold text-white">
            今すぐ始めよう
          </h2>
          <p class="mt-4 text-lg text-primary-100">
            無料で始められます。クレジットカード不要。
          </p>
          <div class="mt-8">
            <CommonButton
              :tag="NuxtLink"
              to="/register"
              variant="secondary"
              size="lg"
              class="bg-white text-primary-600 hover:bg-gray-100"
            >
              無料アカウント作成
            </CommonButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
	title: "zxcv - Coding Rules Platform",
});
</script>