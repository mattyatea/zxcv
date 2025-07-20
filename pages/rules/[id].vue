<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="container-lg py-8">
      <!-- ローディング -->
      <div v-if="loading" class="max-w-4xl mx-auto">
        <div class="skeleton h-10 w-2/3 mb-4"></div>
        <div class="skeleton h-6 w-1/3 mb-8"></div>
        <div class="card">
          <div class="skeleton h-4 w-full mb-2"></div>
          <div class="skeleton h-4 w-3/4 mb-2"></div>
          <div class="skeleton h-4 w-1/2"></div>
        </div>
      </div>

      <!-- ルール詳細 -->
      <div v-else-if="rule" class="max-w-4xl mx-auto">
        <!-- ヘッダー -->
        <div class="mb-8">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="heading-1 mb-3">{{ rule.name }}</h1>
              <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ rule.author.username }}
                </span>
                <span>v{{ rule.version }}</span>
                <span>{{ formatDate(rule.updated_at) }}</span>
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    rule.visibility === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    rule.visibility === 'private' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  ]"
                >
                  {{ rule.visibility === 'public' ? 'パブリック' : rule.visibility === 'private' ? 'プライベート' : 'チーム' }}
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <CommonButton
                v-if="isOwner"
                variant="ghost"
                size="sm"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
              </CommonButton>
              <CommonButton
                variant="primary"
                size="sm"
                @click="_copyRule"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {{ copied ? 'コピーしました！' : 'ルールをコピー' }}
              </CommonButton>
            </div>
          </div>
        </div>

        <!-- 説明 -->
        <div v-if="rule.description" class="card mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">説明</h2>
          <p class="text-gray-600 dark:text-gray-400">{{ rule.description }}</p>
        </div>

        <!-- タグ -->
        <div v-if="rule.tags && rule.tags.length > 0" class="mb-6">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in rule.tags"
                :key="tag"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- ルール内容 -->
        <div class="card mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">ルール内容</h2>
            <CommonButton
              variant="ghost"
              size="xs"
              @click="_copyContent"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </CommonButton>
          </div>
          <div class="relative">
            <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>{{ rule.content }}</code></pre>
          </div>
        </div>

        <!-- バージョン履歴 -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">バージョン履歴</h2>
          <div class="space-y-3">
            <div
              v-for="version in versions"
              :key="version.version"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div>
                <span class="font-medium text-gray-900 dark:text-gray-100">v{{ version.version }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400 ml-3">{{ version.changelog }}</span>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(version.created_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 関連ルール -->
        <div v-if="relatedRules.length > 0" class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">関連するルール</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NuxtLink
              v-for="related in relatedRules"
              :key="related.id"
              :to="`/rules/${related.id}`"
              class="card-hover"
            >
              <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-1">{{ related.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">by {{ related.author.username }}</p>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- エラー -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">ルールが見つかりませんでした</p>
        <NuxtLink to="/rules">
          <CommonButton variant="ghost" class="mt-4">
            ルール一覧に戻る
          </CommonButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";

interface Author {
	id: string;
	username: string;
}

interface Rule {
	id: string;
	name: string;
	description?: string;
	content: string;
	visibility: "public" | "private" | "team";
	author: Author;
	tags: string[];
	version: string;
	updated_at: number;
}

interface Version {
	version: string;
	changelog: string;
	created_at: number;
}

const route = useRoute();
const { $rpc } = useNuxtApp();
const loading = ref(false);
const rule = ref<Rule | null>(null);
const versions = ref<Version[]>([]);
const relatedRules = ref<Rule[]>([]);
const isOwner = ref(false);
const copied = ref(false);
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { success: toastSuccess, error: toastError } = useToast();

const fetchRuleDetails = async () => {
	loading.value = true;
	try {
		const ruleId = route.params.id as string;

		// Fetch rule details
		const data = await $rpc.rules.get({ id: ruleId });

		// Fetch content
		const contentData = await $rpc.rules.getContent({ id: ruleId });

		rule.value = {
			id: data.id,
			name: data.name,
			description: data.description || "",
			content: contentData.content,
			visibility: data.visibility as "public" | "private" | "team",
			author: data.author,
			tags: data.tags || [],
			version: data.version,
			updated_at:
				typeof data.updated_at === "number"
					? data.updated_at
					: Math.floor(new Date(data.updated_at).getTime() / 1000),
		};

		// オーナーかどうかを判定
		isOwner.value = user.value?.id === data.author.id;

		// Fetch version history
		try {
			const versionsData = await $rpc.rules.versions({ id: ruleId });
			versions.value = versionsData;
		} catch (error) {
			console.error("Failed to fetch versions:", error);
		}

		// Fetch related rules
		try {
			const relatedData = await $rpc.rules.related({ id: ruleId });
			relatedRules.value = relatedData;
		} catch (error) {
			console.error("Failed to fetch related rules:", error);
		}
	} catch (error) {
		console.error("Failed to fetch rule details:", error);
		rule.value = null;
	} finally {
		loading.value = false;
	}
};

const _formatDate = (timestamp: number) => {
	return new Date(timestamp * 1000).toLocaleDateString("ja-JP");
};

const _copyRule = async () => {
	if (!rule.value) {
		return;
	}

	try {
		await navigator.clipboard.writeText(rule.value.content);
		copied.value = true;
		toastSuccess("ルールをコピーしました");
		setTimeout(() => {
			copied.value = false;
		}, 2000);
	} catch (error) {
		console.error("Failed to copy:", error);
		toastError("コピーに失敗しました");
	}
};

const _copyContent = async () => {
	if (!rule.value) {
		return;
	}

	try {
		await navigator.clipboard.writeText(rule.value.content);
		toastSuccess("ルール内容をコピーしました");
	} catch (error) {
		console.error("Failed to copy content:", error);
		toastError("コピーに失敗しました");
	}
};

onMounted(() => {
	fetchRuleDetails();
});
</script>