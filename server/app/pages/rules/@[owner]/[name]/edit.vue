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

      <!-- エラー -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-danger mb-4">{{ error }}</p>
        <NuxtLink :to="getRuleUrl()">
          <CommonButton variant="ghost">
            {{ $t('common.back') }}
          </CommonButton>
        </NuxtLink>
      </div>

      <!-- 編集フォーム -->
      <div v-else-if="rule" class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h1 class="heading-1">{{ $t('rules.edit.title') }}</h1>
          <span v-if="hasChanges" class="text-sm text-warning-600 dark:text-warning-400">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {{ $t('rules.edit.unsavedChanges') }}
          </span>
        </div>

        <form @submit.prevent="handleSubmit">
          <CommonCard class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {{ $t('rules.form.basicInfo') }}
            </h2>

            <div class="space-y-4">
              <CommonInput
                v-model="form.name"
                :label="$t('rules.form.name')"
                :placeholder="$t('rules.form.namePlaceholder')"
                required
                disabled
                :error="errors.name"
              />

              <CommonTextarea
                v-model="form.description"
                :label="$t('rules.form.description')"
                :placeholder="$t('rules.form.descriptionPlaceholder')"
                rows="3"
                :error="errors.description"
              />

              <div>
                <label class="label">{{ $t('rules.form.visibility') }}</label>
                <CommonSelect
                  v-model="form.visibility"
                  :options="visibilityOptions"
                  :error="errors.visibility"
                />
              </div>

              <div>
                <label class="label">{{ $t('rules.form.tags') }}</label>
                <CommonTagInput
                  v-model="form.tags"
                  :placeholder="$t('rules.form.tagsPlaceholder')"
                  :error="errors.tags"
                />
              </div>
            </div>
          </CommonCard>

          <CommonCard class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ $t('rules.form.content') }}
              </h2>
              <button
                type="button"
                @click="showPreview = !showPreview"
                class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {{ showPreview ? $t('rules.edit.hidePreview') : $t('rules.edit.showPreview') }}
              </button>
            </div>

            <div v-if="!showPreview">
              <CommonTextarea
                v-model="form.content"
                :placeholder="$t('rules.form.contentPlaceholder')"
                rows="15"
                class="font-mono"
                required
                :error="errors.content"
              />
            </div>
            <div v-else class="prose prose-sm dark:prose-invert max-w-none">
              <div v-html="renderedContent" />
            </div>
          </CommonCard>

          <CommonCard v-if="contentChanged">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {{ $t('rules.edit.changeLog') }}
            </h2>

            <CommonTextarea
              v-model="form.changelog"
              :placeholder="$t('rules.edit.changeLogPlaceholder')"
              rows="3"
              required
              :error="errors.changelog"
            />

            <div class="mt-4">
              <label class="flex items-center gap-2">
                <input
                  v-model="form.isMajorVersionUp"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ $t('rules.edit.incrementMajorVersion') }} ({{ currentVersion }} → {{ nextVersion }})
                </span>
              </label>
            </div>
          </CommonCard>

          <div class="flex justify-end gap-3 mt-8">
            <NuxtLink :to="getRuleUrl()">
              <CommonButton type="button" variant="ghost">
                {{ $t('common.cancel') }}
              </CommonButton>
            </NuxtLink>
            <CommonButton
              type="submit"
              variant="primary"
              :loading="submitting"
              :disabled="!hasChanges"
            >
              {{ $t('rules.edit.update') }}
            </CommonButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import { storeToRefs } from "pinia";
import { computed, onMounted, reactive, ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";
import { useRpc } from "~/app/composables/useRpc";
import type { RuleType, GetRuleResponse, GetRuleContentResponse } from "~/app/types/orpc";

console.log("Edit page loaded - /rules/@[owner]/[name]/edit.vue");

// Using types from orpc.ts
type Rule = GetRuleResponse & { content: string };

const route = useRoute();
const router = useRouter();
const $rpc = useRpc();
const { t } = useI18n();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { success: toastSuccess, error: toastError } = useToast();

// Get route params from parent component or custom provider
interface CustomRouteParams {
	owner?: string;
	name?: string;
	id?: string;
}
const customParams = inject<CustomRouteParams | null>("customRouteParams", null);
const routeParams = computed(() => {
	if (customParams) {
		return customParams;
	}
	return {
		owner: route.params.owner,
		name: route.params.name,
	};
});

const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const rule = ref<Rule | null>(null);
const showPreview = ref(false);

const form = reactive({
	name: "",
	description: "",
	content: "",
	visibility: "private" as "public" | "private",
	tags: [] as string[],
	changelog: "",
	isMajorVersionUp: false,
});

const errors = reactive({
	name: "",
	description: "",
	content: "",
	visibility: "",
	tags: "",
	changelog: "",
});

const visibilityOptions = [
	{ value: "public", label: t("rules.visibility.public") },
	{ value: "private", label: t("rules.visibility.private") },
];

// マークダウンをHTMLに変換
const renderedContent = computed(() => {
	try {
		return marked(form.content || "");
	} catch (e) {
		return form.content || "";
	}
});

// 変更があるかどうかをチェック
const hasChanges = computed(() => {
	if (!rule.value) {
		return false;
	}

	return (
		form.name !== rule.value.name ||
		form.description !== rule.value.description ||
		form.content !== rule.value.content ||
		form.visibility !== rule.value.visibility ||
		JSON.stringify(form.tags) !== JSON.stringify(rule.value.tags)
	);
});

// コンテンツが変更されたかどうか
const contentChanged = computed(() => {
	return rule.value && form.content !== rule.value.content;
});

// 現在のバージョン
const currentVersion = computed(() => {
	if (!rule.value) {
		return "1.0";
	}
	return `v${rule.value.version}`;
});

// 次のバージョン
const nextVersion = computed(() => {
	if (!rule.value) {
		return "v1.0";
	}
	const versionParts = rule.value.version.split(".");
	const majorVersion = Number.parseInt(versionParts[0]) || 1;
	const minorVersion = Number.parseInt(versionParts[1]) || 0;

	if (form.isMajorVersionUp) {
		return `v${majorVersion + 1}.0`;
	} else {
		return `v${majorVersion}.${minorVersion + 1}`;
	}
});

const getRuleUrl = () => {
	if (!rule.value) {
		return "/rules";
	}

	if (rule.value.organization) {
		return `/rules/@${rule.value.organization.name}/${rule.value.name}`;
	}
	return `/rules/@${rule.value.author.username}/${rule.value.name}`;
};

const fetchRule = async () => {
	loading.value = true;
	error.value = "";

	try {
		const owner = routeParams.value.owner as string;
		const ruleName = routeParams.value.name as string;

		// Fetch rule by path (@owner/rulename format)
		const path = `@${owner}/${ruleName}`;
		const data = await $rpc.rules.getByPath({ path });

		// オーナーでない場合はアクセス拒否
		if (data.author.id !== user.value?.id) {
			// 組織のルールの場合、メンバーかどうかチェック
			if (data.organization) {
				const isMember = await $rpc.organizations
					.members({ organizationId: data.organization.id })
					.then((members) => members.some((m) => m.id === user.value?.id))
					.catch(() => false);

				if (!isMember) {
					error.value = t("rules.edit.notOwner");
					return;
				}
			} else {
				error.value = t("rules.edit.notOwner");
				return;
			}
		}

		// コンテンツを取得
		const contentData = await $rpc.rules.getContent({ id: data.id });

		rule.value = {
			id: data.id,
			name: data.name,
			description: data.description || "",
			content: contentData.content,
			visibility: data.visibility as "public" | "private",
			tags: data.tags || [],
			version: data.version,
			author: data.author,
			organization: data.organization,
		};

		// フォームに値を設定
		form.name = rule.value.name;
		form.description = rule.value.description || "";
		form.content = rule.value.content;
		form.visibility = rule.value.visibility;
		form.tags = rule.value.tags;
	} catch (err) {
		console.error("Failed to fetch rule:", err);
		error.value = t("rules.edit.fetchError");
	} finally {
		loading.value = false;
	}
};

const validateForm = () => {
	let valid = true;

	// Reset errors
	Object.keys(errors).forEach((key) => {
		errors[key as keyof typeof errors] = "";
	});

	if (!form.name.trim()) {
		errors.name = t("validation.required");
		valid = false;
	}

	if (!form.content.trim()) {
		errors.content = t("validation.required");
		valid = false;
	}

	// コンテンツが変更された場合のみchangelogを必須にする
	if (rule.value && form.content !== rule.value.content && !form.changelog.trim()) {
		errors.changelog = t("validation.required");
		valid = false;
	}

	return valid;
};

const handleSubmit = async () => {
	if (!validateForm() || !rule.value) {
		return;
	}

	submitting.value = true;

	try {
		await $rpc.rules.update({
			id: rule.value.id,
			description: form.description,
			content: form.content,
			visibility: form.visibility,
			tags: form.tags,
			changelog: form.changelog,
			isMajorVersionUp: form.isMajorVersionUp,
		});

		toastSuccess(t("rules.messages.updateSuccess"));
		await router.push(getRuleUrl());
	} catch (error) {
		console.error("Failed to update rule:", error);
		toastError(t("rules.messages.updateError"));
	} finally {
		submitting.value = false;
	}
};

onMounted(() => {
	console.log("Edit page mounted with params:", routeParams.value);

	if (!user.value) {
		router.push("/login");
		return;
	}

	fetchRule();
});
</script>