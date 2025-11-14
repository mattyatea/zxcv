<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- ヘッダーバー -->
    <div class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="container-lg py-3">
        <div class="flex items-center justify-between">
          <nav class="flex items-center gap-2 text-sm">
            <NuxtLink to="/rules" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              {{ t('rules.title') }}
            </NuxtLink>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-gray-900 dark:text-gray-100 font-medium">{{ rule?.name || 'Loading...' }}</span>
          </nav>
          
          <!-- クイックアクション -->
          <div v-if="rule" class="flex items-center gap-3">
            <CommonButton
              v-if="!isStarred"
              variant="ghost"
              size="sm"
              @click="toggleStar"
              :disabled="starLoading"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {{ t('rules.actions.star') }}
            </CommonButton>
            <CommonButton
              v-else
              variant="primary"
              size="sm"
              @click="toggleStar"
              :disabled="starLoading"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" stroke="none" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {{ t('rules.actions.starred') }}
            </CommonButton>
            
            <div class="relative" v-if="false">
              <CommonButton
                variant="ghost"
                size="sm"
                @click="showShareMenu = !showShareMenu"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684 0m2.684 0a3 3 0 00-2.684 0m-9.032-4.026a3 3 0 002.684 0m6.348 4.026a3 3 0 10-2.684 0m2.684 0a3 3 0 00-2.684 0" />
                </svg>
              </CommonButton>
              
              <!-- 共有メニュー -->
              <transition name="dropdown">
                <div v-if="showShareMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  <button class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    {{ t('rules.actions.copyUrl') }}
                  </button>
                  <button class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    {{ t('rules.actions.shareOnX') }}
                  </button>
                  <button class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    {{ t('rules.actions.copyMarkdown') }}
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-lg py-12">
      <!-- ローディング -->
      <RulesRuleDetailSkeleton v-if="loading" />

      <!-- ルール詳細 -->
      <div v-else-if="rule" class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- メインコンテンツ -->
          <div class="lg:col-span-2">
            <!-- ヘッダー -->
            <div class="mb-10">
              <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-4">
                {{ rule.name }}
                <span
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded-full',
                    rule.type === 'ccsubagents' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                  ]"
                >
                  {{ t(`rules.form.typeOptions.${rule.type || 'rule'}`) }}
                </span>
                <span
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded-full',
                    rule.visibility === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    rule.visibility === 'private' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  ]"
                >
                  {{ t(`rules.visibility.${rule.visibility}`) }}
                </span>
              </h1>
              
              <div class="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <NuxtLink 
                  :to="`/user/${rule.author.username}`"
                  class="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <Avatar
                    :src="rule.author.avatarUrl"
                    :name="rule.author.displayName || rule.author.username"
                    :alt="rule.author.username"
                    size="xs"
                    shape="circle"
                  />
                  <span>{{ rule.author.username }}</span>
                </NuxtLink>
                
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  v{{ rule.version }}
                </span>
                
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(rule.updatedAt) }}
                </span>
              </div>
              
              <!-- 統計情報 -->
              <div class="flex flex-wrap gap-8 mt-8">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span class="text-gray-900 dark:text-gray-100 font-medium">{{ formatNumber(rule.stars || 0) }}</span>
                  <span class="text-gray-600 dark:text-gray-400">{{ t('rules.detail.stars') }}</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span class="text-gray-900 dark:text-gray-100 font-medium">{{ formatNumber(rule.views || 0) }}</span>
                  <span class="text-gray-600 dark:text-gray-400">{{ t('rules.detail.views') }}</span>
                </div>
                
                <div class="flex items-center gap-2" v-if="viewCount && false">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span class="text-gray-900 dark:text-gray-100 font-medium">{{ formatNumber(viewCount) }}</span>
                  <span class="text-gray-600 dark:text-gray-400">{{ t('rules.detail.views') }}</span>
                </div>
              </div>
            </div>

            <!-- テンプレート変数入力 -->
            <div v-if="templateVariables.length > 0" class="mb-8">
              <RulesTemplateVariableInput
                :variables="templateVariables"
                v-model="templateValues"
                @apply="applyTemplate"
              />
            </div>

            <!-- 説明 -->
            <div v-if="rule.description" class="card mb-8">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ t('rules.form.description') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{ rule.description }}</p>
            </div>

            <!-- バージョン表示中の通知 -->
            <div v-if="rule.version !== originalVersion" class="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p class="text-sm text-amber-800 dark:text-amber-200">
                    {{ t('rules.detail.viewingOldVersion', { version: `v${rule.version}` }) }}
                  </p>
                </div>
                <CommonButton
                  size="sm"
                  variant="primary"
                  @click="fetchRuleDetails"
                >
                  {{ t('rules.detail.viewLatestVersion') }}
                </CommonButton>
              </div>
            </div>

            <!-- ルール内容 -->
            <div class="card mb-8">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  {{ t('rules.ruleContent') }}
                </h2>
                <div class="flex items-center gap-2">
                  <CommonButton
                    variant="ghost"
                    size="xs"
                    @click="downloadRule"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </CommonButton>
                  <CommonButton
                    variant="ghost"
                    size="xs"
                    @click="copyContent"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </CommonButton>
                </div>
              </div>
              
              <!-- コンテンツタブ -->
              <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav class="flex gap-4">
                  <button
                    @click="contentView = 'preview'"
                    :class="[
                      'pb-2 px-1 text-sm font-medium border-b-2 transition-colors',
                      contentView === 'preview'
                        ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                        : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-100'
                    ]"
                  >
                    {{ t('rules.detail.preview') }}
                  </button>
                  <button
                    @click="contentView = 'raw'"
                    :class="[
                      'pb-2 px-1 text-sm font-medium border-b-2 transition-colors',
                      contentView === 'raw'
                        ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                        : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-100'
                    ]"
                  >
                    {{ t('rules.detail.raw') }}
                  </button>
                </nav>
              </div>
              
              <div class="relative">
                <!-- Preview表示 -->
                <div v-if="contentView === 'preview'" class="prose prose-gray dark:prose-invert max-w-none p-6 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-[600px] overflow-y-auto">
                  <div v-html="renderMarkdown(renderedContent || rule.content)"></div>
                </div>

                <!-- Raw表示 -->
                <pre v-else class="bg-gray-800 dark:bg-gray-950 text-gray-300 dark:text-gray-100 p-6 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto border border-gray-700 dark:border-gray-800"><code>{{ renderedContent || rule.content }}</code></pre>
                
                <!-- コピー完了通知 -->
                <transition name="fade">
                  <div v-if="contentCopied" class="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm shadow-lg">
                    {{ t('rules.messages.copied') }}
                  </div>
                </transition>
              </div>
            </div>

            <!-- バージョン履歴 -->
            <div class="card">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ t('rules.detail.versionHistory') }}
              </h2>
              <div class="space-y-3">
                <div
                  v-for="version in versions"
                  :key="version.version"
                  :class="[
                    'group flex items-center justify-between p-3 rounded-lg transition-all duration-200',
                    version.version === rule.version
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                  ]"
                  @click="version.version !== rule.version && showVersion(version.version)"
                >
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        v{{ version.version }}
                      </span>
                      <span v-if="version.version === originalVersion" class="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                        {{ t('rules.detail.latest') }}
                      </span>
                      <span v-if="version.version === rule.version" class="px-2 py-0.5 text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
                        {{ t('rules.detail.viewing') }}
                      </span>
                    </div>
                    <p v-if="version.changelog" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {{ version.changelog }}
                    </p>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>{{ formatDate(version.created_at) }}</span>
                    <svg v-if="version.version !== rule.version" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- サイドバー -->
          <div class="space-y-8">
            <!-- アクション -->
            <div class="card">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-6">{{ t('rules.detail.actions') }}</h3>
              <div class="space-y-4">
                <CommonButton
                  variant="primary"
                  size="md"
                  class="w-full"
                  @click="copyRule"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {{ copied ? t('rules.actions.copied') : t('rules.actions.copyRule') }}
                </CommonButton>
                
                <NuxtLink v-if="isOwner" :to="`/rules/@${owner}/${name}/edit`" class="block">
                  <CommonButton
                    variant="ghost"
                    size="md"
                    class="w-full"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {{ t('rules.actions.edit') }}
                  </CommonButton>
                </NuxtLink>
                
                <CommonButton
                  v-if="isOwner"
                  variant="danger"
                  size="md"
                  class="w-full"
                  @click="showDeleteModal = true"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {{ t('rules.actions.delete') }}
                </CommonButton>
              </div>
            </div>

            <!-- CLIコマンド -->
            <div class="card">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ t('rules.detail.cliCommand') }}
              </h3>
              <div class="space-y-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('rules.detail.cliDescription') }}
                </p>
                <div class="relative">
                  <pre class="bg-gray-800 dark:bg-gray-950 text-gray-300 dark:text-gray-100 p-4 rounded-lg text-sm overflow-x-auto pr-12 border border-gray-700 dark:border-gray-800"><code>{{ cliCommand }}</code></pre>
                  <button
                    @click="copyCliCommand"
                    class="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-100 transition-colors"
                    :title="t('common.copy')"
                  >
                    <svg v-if="!cliCopied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- タグ -->
            <div v-if="rule.tags && rule.tags.length > 0" class="card">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {{ t('rules.detail.tags') }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="tag in rule.tags"
                  :key="tag"
                  :to="`/rules?tag=${tag}`"
                  class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  #{{ tag }}
                </NuxtLink>
              </div>
            </div>

            <!-- 作成者情報 -->
            <div class="card">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-6">{{ rule.organization ? t('rules.detail.organization') : t('rules.detail.author') }}</h3>
              
              <!-- 組織の場合 -->
              <div v-if="rule.organization">
                <NuxtLink 
                  :to="`/org/${rule.organization.name}`"
                  class="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded-lg transition-colors"
                >
                  <Avatar
                    :src="rule.organization.avatarUrl"
                    :name="rule.organization.displayName"
                    :alt="rule.organization.displayName"
                    size="lg"
                    shape="circle"
                  />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ rule.organization.displayName }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">@{{ rule.organization.name }}</p>
                  </div>
                </NuxtLink>
                
                <!-- 更新者情報 -->
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ t('rules.detail.updatedBy') }}</p>
                  <NuxtLink 
                    :to="`/user/${rule.author.username}`"
                    class="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded-lg transition-colors"
                  >
                    <Avatar
                      :src="rule.author.avatarUrl"
                      :name="rule.author.displayName || rule.author.username"
                      :alt="rule.author.username"
                      size="md"
                      shape="circle"
                    />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ rule.author.username }}</p>
                    </div>
                  </NuxtLink>
                </div>
              </div>
              
              <!-- 個人の場合 -->
              <NuxtLink 
                v-else
                :to="`/user/${rule.author.username}`"
                class="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded-lg transition-colors"
              >
                <Avatar
                  :src="rule.author.avatarUrl"
                  :name="rule.author.displayName || rule.author.username"
                  :alt="rule.author.username"
                  size="lg"
                  shape="circle"
                />
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ rule.author.username }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('rules.detail.rulesPublished', { count: userRuleCount }) }}</p>
                </div>
              </NuxtLink>
            </div>

            <!-- 関連ルール -->
            <div v-if="relatedRules.length > 0" class="card">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-6">{{ t('rules.detail.relatedRules') }}</h3>
              <div class="space-y-4">
                <NuxtLink
                  v-for="related in relatedRules.slice(0, 5)"
                  :key="related.id"
                  :to="getRuleUrl(related)"
                  class="block p-3 -m-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-1">{{ related.name }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    by {{ related.organization ? '@' + related.organization.name : related.author.username }}
                  </p>
                  <div class="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {{ related.stars || 0 }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      {{ related.views || 0 }}
                    </span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- エラー -->
      <div v-else class="text-center py-24">
        <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {{ t('rules.detail.notFound') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          {{ t('rules.detail.notFoundDescription') }}
        </p>
        <NuxtLink to="/rules">
          <CommonButton variant="primary" size="lg">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {{ t('rules.detail.backToList') }}
          </CommonButton>
        </NuxtLink>
      </div>
    </div>
    
    <!-- 削除確認ダイアログ -->
    <CommonModal v-model="showDeleteModal" :title="t('rules.messages.deleteConfirm')" size="sm">
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('rules.detail.deleteConfirmDescription') }}
      </p>
      <template #footer>
        <CommonButton variant="ghost" @click="showDeleteModal = false">
          {{ t('common.cancel') }}
        </CommonButton>
        <CommonButton variant="danger" @click="deleteRule" :loading="deleting">
          {{ t('common.delete') }}
        </CommonButton>
      </template>
    </CommonModal>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import Avatar from "~/components/common/Avatar.vue";
import { useRpc } from "~/composables/useRpc";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";
import type {
	GetByPathResponse,
	GetRuleContentResponse,
	RuleVersionType,
} from "~/types/orpc";
import { parseTemplateVariables, renderTemplate } from "~/utils/template";

// Type definitions
type Author = {
	id: string;
	username: string;
	displayName?: string | null;
	avatarUrl?: string | null;
	email?: string;
};

type Organization = {
	id: string;
	name: string;
	displayName: string;
	avatarUrl?: string | null;
};

type Rule = {
        id: string;
        name: string;
        description: string;
        content: string;
        visibility: "public" | "private" | "organization";
        author: Author;
        organization: Organization | null;
        tags: string[];
        version: string;
        updatedAt: number;
        views?: number;
        stars?: number;
        type?: "rule" | "ccsubagents" | "config";
        subType?: string | null;
};

type Version = RuleVersionType;

type RelatedRule = {
	id: string;
	name: string;
	version: string;
	content: string;
	description?: string | null;
	author: Author;
	organization?: Organization | null;
	visibility?: "public" | "private" | "organization";
	tags?: string[];
	stars?: number;
	views?: number;
	updated_at?: number;
};

const route = useRoute();
const $rpc = useRpc();
const { t } = useI18n();
const router = useRouter();
const loading = ref(false);
const rule = ref<Rule | null>(null);
const versions = ref<Version[]>([]);
const relatedRules = ref<RelatedRule[]>([]);
const isOwner = ref(false);
const copied = ref(false);
const contentCopied = ref(false);
const cliCopied = ref(false);
const originalVersion = ref<string>("");
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { success: toastSuccess, error: toastError } = useToast();
const showDeleteModal = ref(false);
const deleting = ref(false);
const contentView = ref<"raw" | "preview">("preview");
const showShareMenu = ref(false);
const isStarred = ref(false);
const starLoading = ref(false);
const viewCount = ref(0);
const userRuleCount = ref(0);

// Template variables
const templateVariables = ref<
	Array<{ name: string; defaultValue?: string; description?: string }>
>([]);
const templateValues = ref<Record<string, string>>({});
const renderedContent = ref<string>("");

// Get route params from parent component or directly from route
interface CustomRouteParams {
	owner?: string;
	name?: string;
}
const customParams = inject<CustomRouteParams | null>(
	"customRouteParams",
	null,
);
const owner = computed(() => customParams?.owner || route.params.owner);
const name = computed(() => customParams?.name || route.params.name);

// Computed CLI command with template variables
const cliCommand = computed(() => {
	let command = `zxcv install @${owner.value}/${name.value}`;

	// Add template variable options if any values are set
	if (Object.keys(templateValues.value).length > 0) {
		const options = Object.entries(templateValues.value)
			.filter(([_, value]) => value && value.trim() !== "")
			.map(([key, value]) => `--${key} "${value}"`)
			.join(" ");

		if (options) {
			command += ` ${options}`;
		}
	}

	return command;
});

const fetchRuleDetails = async () => {
	loading.value = true;
	try {
		const path = `@${owner.value}/${name.value}`;

		// Fetch rule details by path
		const data = await $rpc.rules.getByPath({ path });

		// Debug log
		console.log("Rule data:", data);
		console.log("updatedAt:", data.updatedAt, typeof data.updatedAt);

		// Fetch content
		const contentData = await $rpc.rules.getContent({ id: data.id });

		// Record view
		try {
			await $rpc.rules.view({ ruleId: data.id });
		} catch (error) {
			console.error("Failed to record view:", error);
		}

		const ruleData: Rule = {
			id: data.id,
			name: data.name,
			description: data.description || "",
			content: contentData.content,
			visibility: data.visibility,
			author: data.author,
			organization: data.organization || null,
			tags: data.tags || [],
			version: data.version,
			updatedAt: data.updatedAt,
			views: data.views,
			stars: data.stars,
			type: data.type,
		};

		rule.value = ruleData;

		// Parse template variables from content
		templateVariables.value = parseTemplateVariables(contentData.content);
		renderedContent.value = contentData.content;

		// オーナーかどうかを判定
		// 1. ルールの作成者の場合
		// 2. 組織のルールで、現在のユーザーが組織のオーナーの場合
		if (user.value?.id === data.author.id) {
			isOwner.value = true;
		} else if (data.organization && user.value) {
			// ログインしている場合のみ組織のオーナーかどうかを確認
			try {
				const organizations = await $rpc.organizations.list();
				const isOrgOwner = organizations.some(
					(org) =>
						org.id === data.organization?.id && org.owner.id === user.value?.id,
				);
				isOwner.value = isOrgOwner;
			} catch (error) {
				console.error("Failed to check organization ownership:", error);
				isOwner.value = false;
			}
		} else {
			isOwner.value = false;
		}

		// 元のバージョンを保存
		originalVersion.value = data.version;

		// Fetch version history
		try {
			const versionsData = await $rpc.rules.versions({ id: data.id });
			versions.value = versionsData;
		} catch (error) {
			console.error("Failed to fetch versions:", error);
		}

		// Fetch related rules
		try {
			const relatedData = await $rpc.rules.related({ id: data.id, limit: 10 });
			relatedRules.value = relatedData.map((r) => ({
				...r,
				content: "",
			}));
		} catch (error) {
			console.error("Failed to fetch related rules:", error);
		}

		// Check if starred
		if (user.value) {
			// TODO: Check if the rule is starred
			// isStarred.value = await $rpc.rules.isStarred({ ruleId: data.id });
		}

		// Fetch author's rule count
		try {
			const authorRules = await $rpc.rules.list({
				author: data.author.username,
				visibility: "public",
				limit: 1,
			});
			userRuleCount.value = authorRules.total || 0;
		} catch (error) {
			console.error("Failed to fetch author rule count:", error);
			userRuleCount.value = 0;
		}

		// Set page title
		document.title = `${rule.value.name} - ${t("app.name")}`;
	} catch (error) {
		console.error("Failed to fetch rule details:", error);
		rule.value = null;
	} finally {
		loading.value = false;
	}
};

const { locale } = useI18n();

const formatDate = (timestamp: number) => {
	const date = new Date(timestamp * 1000);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (locale.value === "ja") {
		if (diffDays === 0) {
			return t("common.dates.today");
		} else if (diffDays === 1) {
			return t("common.dates.yesterday");
		} else if (diffDays < 7) {
			return t("common.dates.daysAgo", { days: diffDays });
		} else if (diffDays < 30) {
			return t("common.dates.weeksAgo", { weeks: Math.floor(diffDays / 7) });
		} else if (diffDays < 365) {
			return t("common.dates.monthsAgo", { months: Math.floor(diffDays / 30) });
		} else {
			return t("common.dates.yearsAgo", { years: Math.floor(diffDays / 365) });
		}
	} else if (diffDays === 0) {
		return t("common.dates.today");
	} else if (diffDays === 1) {
		return t("common.dates.yesterday");
	} else if (diffDays < 7) {
		return t("common.dates.daysAgo", { days: diffDays });
	} else if (diffDays < 30) {
		return t("common.dates.weeksAgo", { weeks: Math.floor(diffDays / 7) });
	} else if (diffDays < 365) {
		return t("common.dates.monthsAgo", { months: Math.floor(diffDays / 30) });
	} else {
		return t("common.dates.yearsAgo", { years: Math.floor(diffDays / 365) });
	}
};

const formatNumber = (num: number) => {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`;
	} else if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toString();
};

const copyRule = async () => {
	if (!rule.value) {
		return;
	}

	try {
		await navigator.clipboard.writeText(rule.value.content);
		copied.value = true;
		toastSuccess(t("rules.messages.copied"));
		setTimeout(() => {
			copied.value = false;
		}, 2000);
	} catch (error) {
		console.error("Failed to copy:", error);
		toastError(t("rules.messages.copyError"));
	}
};

const copyContent = async () => {
	if (!rule.value) {
		return;
	}

	try {
		// Use rendered content if template was applied, otherwise use original
		const contentToCopy = renderedContent.value || rule.value.content;
		await navigator.clipboard.writeText(contentToCopy);
		contentCopied.value = true;
		setTimeout(() => {
			contentCopied.value = false;
		}, 2000);
	} catch (error) {
		console.error("Failed to copy content:", error);
		toastError(t("rules.messages.copyError"));
	}
};

const copyCliCommand = async () => {
	if (!rule.value) {
		return;
	}

	try {
		await navigator.clipboard.writeText(cliCommand.value);
		cliCopied.value = true;
		toastSuccess(t("rules.messages.cliCommandCopied"));
		setTimeout(() => {
			cliCopied.value = false;
		}, 2000);
	} catch (error) {
		console.error("Failed to copy CLI command:", error);
		toastError(t("rules.messages.copyError"));
	}
};

const applyTemplate = (values: Record<string, string>) => {
	if (!rule.value) {
		return;
	}

	try {
		// Render template with provided values
		renderedContent.value = renderTemplate(rule.value.content, values);
		toastSuccess(t("rules.template.applied"));
	} catch (error) {
		console.error("Failed to apply template:", error);
		toastError(t("rules.template.applyError"));
	}
};

const downloadRule = () => {
	if (!rule.value) {
		return;
	}

	// Use rendered content if template was applied, otherwise use original
	const contentToDownload = renderedContent.value || rule.value.content;
	const blob = new Blob([contentToDownload], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${rule.value.name}.md`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

const getRuleUrl = (rule: {
	name: string;
	author: Author;
	organization?: Organization | null;
}) => {
	if (rule.organization) {
		return `/rules/@${rule.organization.name}/${rule.name}`;
	}
	// User rules
	return `/rules/@${rule.author.username}/${rule.name}`;
};

const showVersion = async (versionNumber: string) => {
	console.log("Showing version:", versionNumber);
	loading.value = true;

	try {
		// まず現在のルールのIDを取得
		const path = `@${owner.value}/${name.value}`;
		const ruleData = await $rpc.rules.getByPath({ path });
		const id = ruleData.id;

		// 特定のバージョンを取得
		const versionData = await $rpc.rules.getVersion({
			id,
			version: versionNumber,
		});

		// 特定バージョンの内容を表示
		const versionRuleData: Rule = {
			id: versionData.id,
			name: versionData.name,
			description: versionData.description || "",
			content: versionData.content,
			visibility: versionData.visibility,
			author: {
				id: versionData.author.id,
				username: versionData.author.username,
			},
			organization: versionData.organization || null,
			tags: versionData.tags,
			version: versionData.version,
			updatedAt: versionData.createdAt,
		};

		rule.value = versionRuleData;

		// テンプレート状態をリセット
		templateValues.value = {};
		templateVariables.value = parseTemplateVariables(versionData.content);
		renderedContent.value = versionData.content;

		// バージョン表示中であることを示すメッセージ
		toastSuccess(
			t("rules.messages.viewingVersion", { version: `v${versionNumber}` }),
		);
	} catch (error) {
		console.error("Failed to fetch version:", error);
		toastError(t("rules.messages.versionFetchError"));
	} finally {
		loading.value = false;
	}
};

const deleteRule = async () => {
	if (!rule.value) {
		return;
	}

	deleting.value = true;
	try {
		await $rpc.rules.delete({ id: rule.value.id });
		showDeleteModal.value = false;
		toastSuccess(t("rules.messages.deleted"));
		// ルール一覧にリダイレクト
		await router.push("/rules");
	} catch (error) {
		console.error("Failed to delete rule:", error);
		toastError(t("rules.messages.deleteError"));
	} finally {
		deleting.value = false;
	}
};

const toggleStar = async () => {
	if (!user.value) {
		toastError(t("rules.detail.loginRequired"));
		return;
	}

	if (!rule.value) {
		return;
	}

	starLoading.value = true;
	try {
		if (isStarred.value) {
			await $rpc.rules.unstar({ ruleId: rule.value.id });
			isStarred.value = false;
			if (rule.value && rule.value.stars !== undefined) {
				rule.value.stars--;
			}
		} else {
			await $rpc.rules.star({ ruleId: rule.value.id });
			isStarred.value = true;
			if (rule.value && rule.value.stars !== undefined) {
				rule.value.stars++;
			}
		}
	} catch (error) {
		console.error("Failed to toggle star:", error);
		toastError(
			isStarred.value
				? t("rules.detail.unstarError")
				: t("rules.detail.starError"),
		);
	} finally {
		starLoading.value = false;
	}
};

// Simple markdown renderer (can be enhanced with a proper markdown library)
const renderMarkdown = (content: string) => {
	// This is a very basic implementation. Consider using a proper markdown library
	return content
		.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
		.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
		.replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
		.replace(/\*\*(.*)\*\*/g, "<strong>$1</strong>")
		.replace(/\*(.*)\*/g, "<em>$1</em>")
		.replace(
			/```(.*?)```/gs,
			'<pre class="bg-gray-800 dark:bg-gray-950 text-gray-300 dark:text-gray-100 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700 dark:border-gray-800"><code>$1</code></pre>',
		)
		.replace(
			/`([^`]+)`/g,
			'<code class="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-sm">$1</code>',
		)
		.replace(/\n/g, "<br>");
};

onMounted(() => {
	fetchRuleDetails();

	// Keyboard shortcuts
	const handleKeyDown = (e: KeyboardEvent) => {
		// Cmd/Ctrl + K でコピー
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			copyRule();
		}
		// v でバージョン履歴にフォーカス
		if (e.key === "v" && !e.ctrlKey && !e.metaKey) {
			const versionSection = document.querySelector(
				'[data-section="versions"]',
			);
			versionSection?.scrollIntoView({ behavior: "smooth" });
		}
	};

	document.addEventListener("keydown", handleKeyDown);

	onBeforeUnmount(() => {
		document.removeEventListener("keydown", handleKeyDown);
	});
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.dropdown-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar styling for content areas */
.prose::-webkit-scrollbar,
pre::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.prose::-webkit-scrollbar-track,
pre::-webkit-scrollbar-track {
  background: transparent;
}

.prose::-webkit-scrollbar-thumb,
pre::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.prose::-webkit-scrollbar-thumb:hover,
pre::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Dark mode scrollbar */
.dark .prose::-webkit-scrollbar-thumb,
.dark pre::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark .prose::-webkit-scrollbar-thumb:hover,
.dark pre::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}
</style>