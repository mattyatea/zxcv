<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full px-4">
      <CommonCard padding="lg" class="text-center">
        <!-- ローディング状態 -->
        <div v-if="loading" class="space-y-4">
          <CommonLoadingSpinner size="lg" class="mx-auto" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            認証処理中...
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ providerName }}アカウントで{{ isRegistering ? 'アカウントを作成' : 'ログイン' }}しています
          </p>
        </div>

        <!-- エラー状態 -->
        <div v-else-if="error" class="space-y-4">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            認証エラー
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ error }}
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <CommonButton variant="primary" @click="navigateTo('/auth')">
              ログインページに戻る
            </CommonButton>
            <CommonButton variant="secondary" @click="retry">
              もう一度試す
            </CommonButton>
          </div>
        </div>

        <!-- 成功状態 -->
        <div v-else-if="success" class="space-y-4">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            認証成功
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            リダイレクトしています...
          </p>
        </div>
      </CommonCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";

// Props and route
const route = useRoute();
const router = useRouter();
const { $rpc } = useNuxtApp();
const authStore = useAuthStore();
const { success: toastSuccess, error: toastError } = useToast();

// State
const provider = computed(() => route.params.provider as string);
const providerName = computed(() => {
	const providers: Record<string, string> = {
		google: "Google",
		github: "GitHub",
	};
	return providers[provider.value] || provider.value;
});

const loading = ref(true);
const error = ref<string | null>(null);
const success = ref(false);
const isRegistering = ref(false);

// Methods
const processOAuthCallback = async () => {
	try {
		// クエリパラメータを取得
		const { code, state, error: oauthError } = route.query;

		// デバッグ情報
		console.log("OAuth callback params:", {
			provider: provider.value,
			hasCode: !!code,
			hasState: !!state,
			hasError: !!oauthError,
		});

		// エラーチェック
		if (oauthError) {
			throw new Error("認証がキャンセルされました");
		}

		if (!code || !state) {
			throw new Error("認証情報が不足しています");
		}

		// stateから情報を取得（registering フラグなど）
		try {
			// Base64URL decode
			const base64 = (state as string).replace(/-/g, "+").replace(/_/g, "/");
			const padding = "=".repeat((4 - (base64.length % 4)) % 4);
			const stateData = JSON.parse(atob(base64 + padding));
			isRegistering.value = stateData.action === "register";
		} catch (e) {
			console.error("Failed to parse state:", e);
			// state のパースに失敗した場合はデフォルトでログインとして扱う
			isRegistering.value = false;
		}

		// OAuth コールバック処理
		const response = await $rpc.auth.oauthCallback({
			provider: provider.value,
			code: code as string,
			state: state as string,
		});

		// 認証情報を保存
		await authStore.setAuthData({
			accessToken: response.accessToken,
			refreshToken: response.refreshToken,
			user: response.user,
		});

		// 成功表示
		success.value = true;
		toastSuccess(
			isRegistering.value
				? `${providerName.value}でアカウントを作成しました`
				: `${providerName.value}でログインしました`,
		);

		// リダイレクト
		setTimeout(() => {
			router.push(response.redirectUrl || "/rules");
		}, 1500);
	} catch (err: any) {
		console.error("OAuth callback error:", err);

		// エラーメッセージの設定
		if (err.message?.includes("already exists")) {
			error.value = "このアカウントは既に別のユーザーに使用されています";
		} else if (err.message?.includes("email not verified")) {
			error.value = "メールアドレスの確認が必要です";
		} else if (err.message?.includes("cancelled")) {
			error.value = "認証がキャンセルされました";
		} else {
			error.value = err.message || "認証処理中にエラーが発生しました";
		}

		toastError(error.value);
	} finally {
		loading.value = false;
	}
};

const retry = () => {
	// 元のプロバイダーでもう一度認証を試みる
	navigateTo(`/auth?provider=${provider.value}`);
};

// Lifecycle
onMounted(() => {
	processOAuthCallback();
});

// SEO
useHead({
	title: `${providerName.value}認証 - ZXCV`,
	meta: [{ name: "robots", content: "noindex,nofollow" }],
});
</script>

<style scoped>
/* アニメーション */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-4 > * {
  animation: fadeIn 0.3s ease-out;
  animation-fill-mode: both;
}

.space-y-4 > *:nth-child(1) {
  animation-delay: 0s;
}

.space-y-4 > *:nth-child(2) {
  animation-delay: 0.1s;
}

.space-y-4 > *:nth-child(3) {
  animation-delay: 0.2s;
}
</style>