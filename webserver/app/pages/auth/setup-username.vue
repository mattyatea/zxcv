<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full px-4">
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        <div class="space-y-6">
          <!-- ヘッダー -->
          <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              ユーザー名を設定
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ providerName }}でのログインを完了するために、ユーザー名を設定してください
            </p>
          </div>

          <!-- フォーム -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ユーザー名
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                :class="[
                  'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                  errors.username
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                ]"
                placeholder="your-username"
                autocomplete="username"
                :disabled="loading"
                @input="checkUsername"
              />
              <p v-if="errors.username" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.username }}
              </p>
              <p v-else-if="isChecking" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                利用可能か確認中...
              </p>
              <p v-else-if="username && isAvailable" class="mt-1 text-sm text-green-600 dark:text-green-400">
                このユーザー名は利用可能です
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                英数字、ハイフン、アンダースコアのみ使用可能（3-32文字）
              </p>
            </div>

            <!-- エラーメッセージ -->
            <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p class="text-sm text-red-800 dark:text-red-200">
                {{ error }}
              </p>
            </div>

            <!-- ボタン -->
            <div class="space-y-3">
              <button
                type="submit"
                :disabled="!isValid || loading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  処理中...
                </span>
                <span v-else>アカウントを作成</span>
              </button>
              <button
                type="button"
                @click="handleCancel"
                :disabled="loading"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                キャンセル
              </button>
            </div>
          </form>

          <!-- 注意事項 -->
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>注意:</strong> ユーザー名は一度設定すると変更できません
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRpc } from "~/composables/useRpc";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";
import { debounce } from "~/utils/debounce";

// Props and route
const route = useRoute();
const router = useRouter();
const $rpc = useRpc();
const authStore = useAuthStore();
const { success: toastSuccess, error: toastError } = useToast();

// Query params
const tempToken = computed(() => route.query.token as string);
const provider = computed(() => route.query.provider as string);
const providerName = computed(() => {
	const providers: Record<string, string> = {
		google: "Google",
		github: "GitHub",
	};
	return providers[provider.value] || provider.value;
});

// State
const username = ref("");
const loading = ref(false);
const isChecking = ref(false);
const isAvailable = ref(false);
const error = ref<string | null>(null);
const errors = ref<{ username?: string }>({});

// Computed
const isValid = computed(() => {
	return username.value && !errors.value.username && isAvailable.value && !isChecking.value;
});

// Username validation regex
const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_]{2,31}$/;

// Debounced username check
const checkUsernameAvailability = async (value: string) => {
	if (!value || !usernameRegex.test(value)) {
		isAvailable.value = false;
		return;
	}

	isChecking.value = true;
	try {
		const response = await $rpc.auth.checkUsername({ username: value });
		isAvailable.value = response.available;
		if (!response.available) {
			errors.value.username = "このユーザー名は既に使用されています";
		}
	} catch (err) {
		console.error("Username check error:", err);
		isAvailable.value = false;
	} finally {
		isChecking.value = false;
	}
};

const debouncedCheck = debounce(checkUsernameAvailability, 500);

// Methods
const checkUsername = (event: Event) => {
	const value = (event.target as HTMLInputElement).value;
	errors.value.username = "";
	isAvailable.value = false;

	if (!value) {
		errors.value.username = "ユーザー名を入力してください";
		return;
	}

	if (value.length < 3) {
		errors.value.username = "ユーザー名は3文字以上である必要があります";
		return;
	}

	if (value.length > 32) {
		errors.value.username = "ユーザー名は32文字以下である必要があります";
		return;
	}

	if (!usernameRegex.test(value)) {
		errors.value.username = "英数字、ハイフン、アンダースコアのみ使用できます";
		return;
	}

	debouncedCheck(value);
};

const handleSubmit = async () => {
	if (!isValid.value || !tempToken.value) {
		return;
	}

	loading.value = true;
	error.value = null;

	try {
		// Complete OAuth registration with chosen username
		const response = await $rpc.auth.completeOAuthRegistration({
			tempToken: tempToken.value,
			username: username.value,
		});

		// Save auth data
		await authStore.setAuthData({
			accessToken: response.accessToken,
			refreshToken: response.refreshToken,
			user: response.user,
		});

		toastSuccess("アカウントを作成しました");
		router.push("/rules");
	} catch (err) {
		console.error("Registration error:", err);
		error.value = (err as Error).message || "アカウントの作成に失敗しました";
		toastError(error.value);
	} finally {
		loading.value = false;
	}
};

const handleCancel = () => {
	router.push("/login");
};

// Check if we have required params
onMounted(() => {
	if (!tempToken.value || !provider.value) {
		toastError("無効なリクエストです");
		router.push("/login");
	}
});

// SEO
useHead({
	title: "ユーザー名の設定 - ZXCV",
	meta: [{ name: "robots", content: "noindex,nofollow" }],
});
</script>