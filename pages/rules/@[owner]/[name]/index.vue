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
                  {{ $t(`rules.visibility.${rule.visibility}`) }}
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <NuxtLink v-if="isOwner" :to="`/rules/@${owner}/${name}/edit`">
                <CommonButton
                  variant="ghost"
                  size="sm"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {{ $t('rules.actions.edit') }}
                </CommonButton>
              </NuxtLink>
              <CommonButton
                v-if="isOwner"
                variant="danger"
                size="sm"
                @click="showDeleteModal = true"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ $t('rules.actions.delete') }}
              </CommonButton>
              <CommonButton
                variant="primary"
                size="sm"
                @click="copyRule"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {{ copied ? $t('rules.actions.copied') : $t('rules.actions.copyRule') }}
              </CommonButton>
            </div>
          </div>
        </div>

        <!-- 説明 -->
        <div v-if="rule.description" class="card mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{{ $t('rules.form.description') }}</h2>
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

        <!-- バージョン表示中の通知 -->
        <div v-if="rule.version !== originalVersion" class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div class="flex items-center justify-between">
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              {{ $t('rules.detail.viewingOldVersion', { version: `v${rule.version}` }) }}
            </p>
            <CommonButton
              size="sm"
              variant="primary"
              @click="fetchRuleDetails"
            >
              {{ $t('rules.detail.viewLatestVersion') }}
            </CommonButton>
          </div>
        </div>

        <!-- ルール内容 -->
        <div class="card mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ $t('rules.ruleContent') }}</h2>
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
          <div class="relative">
            <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>{{ rule.content }}</code></pre>
          </div>
        </div>

        <!-- バージョン履歴 -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('rules.detail.versionHistory') }}</h2>
          <div class="space-y-3">
            <div
              v-for="version in versions"
              :key="version.version"
              class="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              @click="version.version !== rule.version && showVersion(version.version)"
            >
              <div class="flex-1">
                <span class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  v{{ version.version }}
                  <span v-if="version.version === originalVersion" class="ml-2 text-xs text-green-600 dark:text-green-400">
                    ({{ $t('rules.detail.latest') }})
                  </span>
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400 ml-3">{{ version.changelog }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(version.created_at) }}
                </span>
                <span v-if="version.version === rule.version" class="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {{ $t('rules.detail.currentlyViewing') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 関連ルール -->
        <div v-if="relatedRules.length > 0" class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{{ $t('rules.detail.relatedRules') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NuxtLink
              v-for="related in relatedRules"
              :key="related.id"
              :to="getRuleUrl(related)"
              class="card-hover"
            >
              <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-1">{{ related.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">by {{ related.organization ? '@' + related.organization.name : related.author.username }}</p>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- エラー -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">{{ $t('rules.detail.notFound') }}</p>
        <NuxtLink to="/rules">
          <CommonButton variant="ghost" class="mt-4">
            {{ $t('rules.detail.backToList') }}
          </CommonButton>
        </NuxtLink>
      </div>
    </div>
    
    <!-- 削除確認ダイアログ -->
    <CommonModal v-model="showDeleteModal" :title="$t('rules.messages.deleteConfirm')" size="sm">
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('rules.messages.deleteConfirm') }}
      </p>
      <template #footer>
        <CommonButton variant="ghost" @click="showDeleteModal = false">
          {{ $t('common.cancel') }}
        </CommonButton>
        <CommonButton variant="danger" @click="deleteRule" :loading="deleting">
          {{ $t('common.delete') }}
        </CommonButton>
      </template>
    </CommonModal>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";

interface Author {
	id: string;
	username: string;
}

interface Organization {
	id: string;
	name: string;
	displayName: string;
}

interface Rule {
	id: string;
	name: string;
	description?: string;
	content: string;
	visibility: "public" | "private" | "organization";
	author: Author;
	organization?: Organization;
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
const { t } = useI18n();
const router = useRouter();
const loading = ref(false);
const rule = ref<Rule | null>(null);
const versions = ref<Version[]>([]);
const relatedRules = ref<Rule[]>([]);
const isOwner = ref(false);
const copied = ref(false);
const originalVersion = ref<string>("");
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { success: toastSuccess, error: toastError } = useToast();
const showDeleteModal = ref(false);
const deleting = ref(false);

// Get route params from parent component or directly from route
interface CustomRouteParams {
	owner?: string;
	name?: string;
}
const customParams = inject<CustomRouteParams | null>("customRouteParams", null);
const owner = computed(() => customParams?.owner || route.params.owner);
const name = computed(() => customParams?.name || route.params.name);

const fetchRuleDetails = async () => {
	loading.value = true;
	try {
		const path = `@${owner.value}/${name.value}`;

		// Fetch rule details by path
		const data = await $rpc.rules.getByPath({ path });

		// Fetch content
		const contentData = await $rpc.rules.getContent({ id: data.id });

		rule.value = {
			id: data.id,
			name: data.name,
			description: data.description || "",
			content: contentData.content,
			visibility: data.visibility as "public" | "private" | "organization",
			author: data.author,
			organization: data.organization,
			tags: data.tags || [],
			version: data.version,
			updated_at:
				typeof data.updated_at === "number"
					? data.updated_at
					: Math.floor(new Date(data.updated_at).getTime() / 1000),
		};

		// オーナーかどうかを判定
		isOwner.value = user.value?.id === data.author.id;

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
			const relatedData = await $rpc.rules.related({ id: data.id });
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

const { locale } = useI18n();

const formatDate = (timestamp: number) => {
	return new Date(timestamp * 1000).toLocaleDateString(locale.value === "ja" ? "ja-JP" : "en-US");
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
		await navigator.clipboard.writeText(rule.value.content);
		toastSuccess(t("rules.messages.contentCopied"));
	} catch (error) {
		console.error("Failed to copy content:", error);
		toastError(t("rules.messages.copyError"));
	}
};

const getRuleUrl = (rule: { name: string; author: Author; organization?: Organization }) => {
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
		const versionData = await $rpc.rules.getVersion({ id, version: versionNumber });

		// 特定バージョンの内容を表示
		rule.value = {
			id: versionData.id,
			name: versionData.name,
			description: versionData.description || "",
			content: versionData.content,
			visibility: versionData.visibility as "public" | "private" | "organization",
			author: versionData.author,
			organization: versionData.organization,
			tags: versionData.tags,
			version: versionData.version,
			updated_at: versionData.createdAt,
		};

		// バージョン表示中であることを示すメッセージ
		toastSuccess(t("rules.messages.viewingVersion", { version: `v${versionNumber}` }));
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

onMounted(() => {
	fetchRuleDetails();
});
</script>