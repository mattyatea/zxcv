<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full px-4">
      <CommonCard padding="lg" class="text-center">
        <div v-if="loading" class="space-y-4">
          <CommonLoadingSpinner size="lg" class="mx-auto" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            認証処理中...
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ provider === 'google' ? 'Google' : 'GitHub' }}アカウントでログインしています
          </p>
        </div>

        <div v-else-if="error" class="space-y-4">
          <div class="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            認証エラー
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ error }}
          </p>
          <CommonButton variant="primary" @click="navigateTo('/login')">
            ログインページに戻る
          </CommonButton>
        </div>
      </CommonCard>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const router = useRouter();
const { $rpc } = useNuxtApp();
const authStore = useAuthStore();

const provider = ref(route.params.provider);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
	const { code, state, error: oauthError } = route.query;

	if (oauthError) {
		error.value = "認証がキャンセルされたか、エラーが発生しました。";
		loading.value = false;
		return;
	}

	if (!code || !state) {
		error.value = "認証パラメータが不足しています。";
		loading.value = false;
		return;
	}

	try {
		const response = await $rpc.auth.oauthCallback({
			provider: provider.value,
			code,
			state,
		});

		// Store tokens and user data directly
		// The auth store handles reactivity internally
		if (process.client) {
			localStorage.setItem("access_token", response.accessToken);
			localStorage.setItem("refresh_token", response.refreshToken);
			localStorage.setItem("user", JSON.stringify(response.user));

			// Initialize auth store with the stored data
			authStore.initializeAuth();
		}

		// Redirect to the intended page or rules
		await navigateTo(response.redirectUrl || "/rules");
	} catch (err) {
		console.error("OAuth callback error:", err);
		error.value = err.message || "認証処理中にエラーが発生しました。";
		loading.value = false;
	}
});
</script>