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
        <NuxtLink :to="`/rules/${route.params.id}`">
          <CommonButton variant="ghost">
            {{ $t('common.back') }}
          </CommonButton>
        </NuxtLink>
      </div>

      <!-- 編集フォーム -->
      <div v-else-if="rule" class="max-w-4xl mx-auto">
        <h1 class="heading-1 mb-8">{{ $t('rules.edit.title') }}</h1>

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
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {{ $t('rules.form.content') }}
            </h2>

            <CommonTextarea
              v-model="form.content"
              :placeholder="$t('rules.form.contentPlaceholder')"
              rows="15"
              class="font-mono"
              required
              :error="errors.content"
            />
          </CommonCard>

          <CommonCard>
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
          </CommonCard>

          <div class="flex justify-end gap-3 mt-8">
            <NuxtLink :to="`/rules/${route.params.id}`">
              <CommonButton type="button" variant="ghost">
                {{ $t('common.cancel') }}
              </CommonButton>
            </NuxtLink>
            <CommonButton
              type="submit"
              variant="primary"
              :loading="submitting"
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
import { storeToRefs } from "pinia";
import { onMounted, reactive, ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";

interface Rule {
	id: string;
	name: string;
	description?: string;
	content: string;
	visibility: "public" | "private" | "organization";
	tags: string[];
	version: string;
	author: {
		id: string;
		username: string;
	};
}

const route = useRoute();
const router = useRouter();
const { $rpc } = useNuxtApp();
const { t } = useI18n();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { success: toastSuccess, error: toastError } = useToast();

const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const rule = ref<Rule | null>(null);

const form = reactive({
	name: "",
	description: "",
	content: "",
	visibility: "private" as "public" | "private" | "organization",
	tags: [] as string[],
	changelog: "",
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
	{ value: "organization", label: t("rules.visibility.organization") },
];

const fetchRule = async () => {
	loading.value = true;
	error.value = "";

	try {
		const ruleId = route.params.id as string;

		// ルールの詳細を取得
		const data = await $rpc.rules.get({ id: ruleId });

		// オーナーでない場合はアクセス拒否
		if (data.author.id !== user.value?.id) {
			error.value = t("rules.edit.notOwner");
			return;
		}

		// コンテンツを取得
		const contentData = await $rpc.rules.getContent({ id: ruleId });

		rule.value = {
			id: data.id,
			name: data.name,
			description: data.description || "",
			content: contentData.content,
			visibility: data.visibility as "public" | "private" | "organization",
			tags: data.tags || [],
			version: data.version,
			author: data.author,
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

	if (!form.changelog.trim()) {
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
			name: form.name,
			description: form.description,
			content: form.content,
			visibility: form.visibility,
			tags: form.tags,
			changelog: form.changelog,
		});

		toastSuccess(t("rules.messages.updateSuccess"));
		await router.push(`/rules/${rule.value.id}`);
	} catch (error) {
		console.error("Failed to update rule:", error);
		toastError(t("rules.messages.updateError"));
	} finally {
		submitting.value = false;
	}
};

onMounted(() => {
	if (!user.value) {
		router.push("/login");
		return;
	}

	fetchRule();
});
</script>