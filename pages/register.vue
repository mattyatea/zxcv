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
            すでにアカウントをお持ちの方は
            <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              ログイン
            </NuxtLink>
          </p>
        </div>
      
        <CommonCard padding="lg" class="shadow-xl border-0">
          <form class="space-y-6" @submit.prevent="handleRegister">
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
          </form>
        </CommonCard>
      </div>
    </div>
    
    <!-- Right panel with features -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 relative overflow-hidden">
      <div class="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
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
        
        <!-- Floating elements -->
        <div class="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
        <div class="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-float delay-1000" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

useHead({
	title: "Register - ZXCV",
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
</script>