<template>
  <div class="min-h-screen flex">
    <!-- Left panel with form -->
    <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            アカウント作成
          </h2>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            GitHubまたはGoogleアカウントで簡単に始められます
          </p>
        </div>
      
        <CommonCard padding="lg" class="shadow-xl border-0">
          <form class="space-y-6" @submit.prevent="_handleRegister">
            <div class="space-y-4">
              <CommonInput
                v-model="form.username"
                type="text"
                label="ユーザー名"
                placeholder="johndoe"
                hint="英数字、アンダースコア、ハイフンのみ"
                required
                pattern="[a-zA-Z0-9_-]+"
                size="lg"
              >
                <template #prefix>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </template>
              </CommonInput>
              
              <CommonInput
                v-model="form.email"
                type="email"
                label="メールアドレス"
                placeholder="your@email.com"
                required
                size="lg"
              >
                <template #prefix>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </template>
              </CommonInput>
              
              <CommonInput
                v-model="form.password"
                type="password"
                label="パスワード"
                placeholder="••••••••"
                hint="8文字以上"
                required
                size="lg"
              >
                <template #prefix>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </template>
              </CommonInput>
              
              <CommonInput
                v-model="form.confirmPassword"
                type="password"
                label="パスワード（確認）"
                placeholder="••••••••"
                required
                size="lg"
                :error="form.password !== form.confirmPassword && form.confirmPassword ? 'パスワードが一致しません' : ''"
              >
                <template #prefix>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </template>
              </CommonInput>
            </div>

            <label class="flex items-start">
              <input
                v-model="form.agreeToTerms"
                type="checkbox"
                required
                class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                <a href="#" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">利用規約</a>
                および
                <a href="#" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">プライバシーポリシー</a>
                に同意します
              </span>
            </label>

            <CommonButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              :loading="loading"
              :disabled="!form.agreeToTerms"
            >
              {{ loading ? 'アカウント作成中...' : 'アカウントを作成' }}
            </CommonButton>

            <div v-if="error" class="rounded-lg bg-danger/10 border border-danger/20 p-4">
              <p class="text-sm text-danger">{{ error }}</p>
            </div>

            <div v-if="success" class="rounded-lg bg-success/10 border border-success/20 p-4">
              <p class="text-sm text-success">
                アカウントが作成されました！メールを確認してアカウントを有効化してください。
              </p>
            </div>
            
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white dark:bg-gray-900 text-gray-500">または</span>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="btn btn-secondary btn-md justify-center"
                @click="_handleSocialLogin('google')"
                :disabled="loading"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-md justify-center"
                @click="_handleSocialLogin('github')"
                :disabled="loading"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>
        </CommonCard>
      </div>
    </div>
    
    <!-- Right panel with features -->
    <div class="hidden lg:flex lg:w-1/2 relative">
      <div class="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
        <h2 class="text-3xl font-bold mb-8">無料で始められる機能</h2>
        
        <div class="space-y-6">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg">無制限のルール作成</h3>
              <p class="text-primary-100">好きなだけルールを作成・管理できます</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg">バージョン管理</h3>
              <p class="text-primary-100">すべての変更履歴を自動保存</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg">チームコラボレーション</h3>
              <p class="text-primary-100">メンバーを招待して共同編集</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

definePageMeta({
	layout: "auth",
});

useHead({
	title: "Register - zxcv",
});

const form = ref({
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
	agreeToTerms: false,
});

const loading = ref(false);
const error = ref("");
const success = ref(false);

const { $rpc } = useNuxtApp();

const _handleRegister = async () => {
	loading.value = true;
	error.value = "";
	success.value = false;

	// Validate passwords match
	if (form.value.password !== form.value.confirmPassword) {
		error.value = "パスワードが一致しません";
		loading.value = false;
		return;
	}

	try {
		const _response = await $rpc.auth.register({
			username: form.value.username,
			email: form.value.email,
			password: form.value.password,
		});

		success.value = true;

		// Clear form
		form.value = {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
			agreeToTerms: false,
		};

		// Redirect to login after a delay
		setTimeout(() => {
			navigateTo("/login");
		}, 3000);
	} catch (err) {
		error.value = err.message || "アカウントの作成に失敗しました";
	} finally {
		loading.value = false;
	}
};

const _handleSocialLogin = async (provider) => {
	loading.value = true;
	error.value = "";

	try {
		const response = await $rpc.auth.oauthInitialize({
			provider,
			redirectUrl: "/rules",
		});

		// Redirect to OAuth provider
		window.location.href = response.authorizationUrl;
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : `Failed to initialize ${provider} login`;
		error.value = errorMessage;
		loading.value = false;
	}
};
</script>