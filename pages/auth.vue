<template>
	<div class="min-h-screen flex">
		<!-- Left panel with branding -->
		<div class="hidden lg:flex lg:w-1/2 relative">
			<div class="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
				<div class="mb-8 float-animation">
					<div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
						<span class="text-4xl font-bold text-white">Z</span>
					</div>
				</div>
				<Transition :name="activeTab === 'login' ? 'tab-slide' : 'tab-slide-reverse'" mode="out-in">
					<div v-if="activeTab === 'login'" key="login-text">
						<h1 class="text-4xl xl:text-5xl font-bold mb-4">
							AIコーディングルールを<br />
							チームで共有
						</h1>
						<p class="text-xl text-white/90">
							コード品質を保ちながら、<br />
							開発効率を最大化
						</p>
					</div>
					<div v-else key="register-text">
						<h1 class="text-4xl xl:text-5xl font-bold mb-4">
							無料で始められる<br />
							プレミアムな体験
						</h1>
						<div class="space-y-4 mt-8">
							<div class="flex items-center space-x-3 stagger-item stagger-1">
								<svg class="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span class="text-lg text-white/90">無制限のルール作成</span>
							</div>
							<div class="flex items-center space-x-3 stagger-item stagger-2">
								<svg class="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span class="text-lg text-white/90">バージョン管理機能</span>
							</div>
							<div class="flex items-center space-x-3 stagger-item stagger-3">
								<svg class="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								<span class="text-lg text-white/90">チームコラボレーション</span>
							</div>
						</div>
					</div>
				</Transition>
			</div>
		</div>

		<!-- Right panel with form -->
		<div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
			<div class="max-w-md w-full">
				<!-- Tab switcher -->
				<div class="relative flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-8">
					<!-- Animated background indicator -->
					<div 
						class="absolute h-[calc(100%-8px)] bg-white dark:bg-gray-900 rounded-lg shadow-sm transition-all duration-300 ease-out"
						:style="{
							width: '50%',
							transform: `translateX(${activeTab === 'login' ? '0' : '100%'})`
						}"
					/>
					
					<button
						@click="switchTab('login')"
						:class="[
							'relative z-10 flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200',
							activeTab === 'login' 
								? 'text-gray-900 dark:text-white' 
								: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
						]"
					>
						ログイン
					</button>
					<button
						@click="switchTab('register')"
						:class="[
							'relative z-10 flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200',
							activeTab === 'register' 
								? 'text-gray-900 dark:text-white' 
								: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
						]"
					>
						アカウント作成
					</button>
				</div>

				<CommonCard padding="lg" class="shadow-xl border-0">
					<!-- Login Form -->
					<Transition name="seamless-form" mode="out-in">
						<form v-if="activeTab === 'login'" key="login" class="space-y-6" @submit.prevent="handleLogin">
							<div class="space-y-4">
								<CommonInput
									v-model="loginForm.email"
									type="email"
									label="メールアドレス"
									placeholder="your@email.com"
									required
									size="lg"
									class="pulse-on-focus"
								>
									<template #prefix>
										<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</template>
								</CommonInput>

								<CommonInput
									v-model="loginForm.password"
									type="password"
									label="パスワード"
									placeholder="••••••••"
									required
									size="lg"
									class="pulse-on-focus"
								>
									<template #prefix>
										<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									</template>
								</CommonInput>
							</div>

							<div class="flex items-center justify-between">
								<label class="flex items-center">
									<input
										v-model="loginForm.rememberMe"
										type="checkbox"
										class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
									/>
									<span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
										ログイン状態を保持
									</span>
								</label>

								<NuxtLink to="/forgot-password" class="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
									パスワードを忘れた方
								</NuxtLink>
							</div>

							<CommonButton
								type="submit"
								variant="primary"
								size="lg"
								fullWidth
								:loading="loading"
								class="btn-animated"
							>
								<span class="relative z-10">{{ loading ? 'ログイン中...' : 'ログイン' }}</span>
							</CommonButton>
						</form>

						<!-- Register Form -->
						<form v-else key="register" class="space-y-6" @submit.prevent="handleRegister">
							<div class="space-y-4">
								<CommonInput
									v-model="registerForm.username"
									type="text"
									label="ユーザー名"
									placeholder="johndoe"
									hint="英数字、アンダースコア、ハイフンのみ"
									required
									pattern="[a-zA-Z0-9_-]+"
									size="lg"
									class="pulse-on-focus"
								>
									<template #prefix>
										<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
									</template>
								</CommonInput>

								<CommonInput
									v-model="registerForm.email"
									type="email"
									label="メールアドレス"
									placeholder="your@email.com"
									required
									size="lg"
									class="pulse-on-focus"
								>
									<template #prefix>
										<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</template>
								</CommonInput>

								<CommonInput
									v-model="registerForm.password"
									type="password"
									label="パスワード"
									placeholder="••••••••"
									hint="8文字以上"
									required
									size="lg"
									class="pulse-on-focus"
								>
									<template #prefix>
										<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									</template>
								</CommonInput>

								<CommonInput
									v-model="registerForm.confirmPassword"
									type="password"
									label="パスワード（確認）"
									placeholder="••••••••"
									required
									size="lg"
									:error="registerForm.password !== registerForm.confirmPassword && registerForm.confirmPassword ? 'パスワードが一致しません' : ''"
									class="pulse-on-focus"
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
									v-model="registerForm.agreeToTerms"
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
								:disabled="!registerForm.agreeToTerms"
								class="btn-animated"
							>
								<span class="relative z-10">{{ loading ? 'アカウント作成中...' : 'アカウントを作成' }}</span>
							</CommonButton>
						</form>
					</Transition>

					<Transition name="message-fade">
						<div v-if="error" class="rounded-lg bg-danger/10 border border-danger/20 p-4 mt-4 message-animate error-shake">
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-danger flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p class="text-sm text-danger">{{ error }}</p>
							</div>
						</div>
					</Transition>

					<Transition name="message-fade">
						<div v-if="message" class="rounded-lg bg-success/10 border border-success/20 p-4 mt-4 message-animate">
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p class="text-sm text-success">{{ message }}</p>
							</div>
						</div>
					</Transition>

					<div class="relative mt-8">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-gray-300 dark:border-gray-700" />
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-500 font-medium">または</span>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-3 mt-6">
						<button
							type="button"
							class="btn btn-secondary btn-md justify-center social-btn-hover"
							@click="handleSocialLogin('google')"
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
							class="btn btn-secondary btn-md justify-center social-btn-hover"
							@click="handleSocialLogin('github')"
							:disabled="loading"
						>
							<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
							</svg>
							GitHub
						</button>
					</div>
				</CommonCard>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
	layout: "auth",
});

useHead({
	title: "認証 - ZXCV",
});

const route = useRoute();
const authStore = useAuthStore();
const { error: toastError, success: toastSuccess } = useToast();
const { $rpc } = useNuxtApp();

// Determine initial tab based on route
const activeTab = ref(route.query.tab === "register" ? "register" : "login");
const isTransitioning = ref(false);

// Watch for tab changes and update URL
watch(activeTab, (newTab) => {
	navigateTo({ query: { tab: newTab } }, { replace: true });
});

// Smooth tab switching
const _switchTab = (tab) => {
	if (isTransitioning.value || activeTab.value === tab) {
		return;
	}

	isTransitioning.value = true;
	activeTab.value = tab;

	// Reset transition flag after animation completes
	setTimeout(() => {
		isTransitioning.value = false;
	}, 500);
};

const loginForm = ref({
	email: "",
	password: "",
	rememberMe: false,
});

const registerForm = ref({
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
	agreeToTerms: false,
});

const loading = ref(false);
const error = ref("");
const message = ref("");

const _handleLogin = async () => {
	loading.value = true;
	error.value = "";
	message.value = "";

	try {
		const response = await authStore.login(loginForm.value);

		if (response.user && !response.user.emailVerified) {
			message.value = response.message || "メールアドレスを確認してからログインしてください。";
			return;
		}

		toastSuccess("ログインしました");
		await navigateTo("/rules");
	} catch (err) {
		error.value = err.message || "メールアドレスまたはパスワードが正しくありません";
		toastError(err.message || "ログインに失敗しました");
	} finally {
		loading.value = false;
	}
};

const _handleRegister = async () => {
	loading.value = true;
	error.value = "";
	message.value = "";

	// Validate passwords match
	if (registerForm.value.password !== registerForm.value.confirmPassword) {
		error.value = "パスワードが一致しません";
		loading.value = false;
		return;
	}

	try {
		await $rpc.auth.register({
			username: registerForm.value.username,
			email: registerForm.value.email,
			password: registerForm.value.password,
		});

		message.value = "アカウントが作成されました！メールを確認してアカウントを有効化してください。";
		toastSuccess("アカウントを作成しました");

		// Clear form and switch to login tab
		registerForm.value = {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
			agreeToTerms: false,
		};

		setTimeout(() => {
			activeTab.value = "login";
		}, 2000);
	} catch (err) {
		error.value = err.message || "アカウントの作成に失敗しました";
		toastError(err.message || "アカウントの作成に失敗しました");
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

		window.location.href = response.authorizationUrl;
	} catch (err) {
		error.value = err.message || `${provider}でのログインに失敗しました`;
		loading.value = false;
	}
};
</script>

<style scoped>
/* Logo hover effect */
.logo-hover {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-hover:hover {
	transform: translateY(-4px) scale(1.05);
	box-shadow: 0 20px 40px -10px rgba(255, 255, 255, 0.25);
}

/* Feature items hover */
.feature-item {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-item:hover {
	transform: translateX(8px);
}

/* Input modern style */
.input-modern {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-modern:focus-within {
	transform: translateY(-2px);
	box-shadow: 0 12px 24px -8px rgba(59, 130, 246, 0.15);
}

/* Animated button */
.btn-animated {
	position: relative;
	overflow: hidden;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-animated::before {
	content: "";
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	transition: left 0.5s;
}

.btn-animated:hover::before {
	left: 100%;
}

.btn-animated:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px -6px rgba(59, 130, 246, 0.4);
}

/* Social buttons hover */
.social-btn-hover {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
}

.social-btn-hover:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.1);
}

.social-btn-hover::after {
	content: "";
	position: absolute;
	inset: 0;
	background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
	opacity: 0;
	transition: opacity 0.3s;
}

.social-btn-hover:hover::after {
	opacity: 1;
}

/* Stagger animations */
.stagger-item {
	transform: translateY(20px);
	opacity: 0;
	animation: staggerIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes staggerIn {
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.stagger-1 {
	animation-delay: 0.1s;
}

.stagger-2 {
	animation-delay: 0.2s;
}

.stagger-3 {
	animation-delay: 0.3s;
}

/* Float animation */
.float-animation {
	animation: float 6s ease-in-out infinite;
}

@keyframes float {
	0%, 100% {
		transform: translateY(0) rotate(0deg);
	}
	25% {
		transform: translateY(-10px) rotate(1deg);
	}
	50% {
		transform: translateY(5px) rotate(-1deg);
	}
	75% {
		transform: translateY(-5px) rotate(0.5deg);
	}
}

/* Pulse slow animation */
.animate-pulse-slow {
	animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slow {
	0%, 100% {
		opacity: 0.6;
		transform: scale(1);
	}
	50% {
		opacity: 0.3;
		transform: scale(1.05);
	}
}

/* Grid pattern for right panel */
.bg-grid-gray-900\/\[0\.03\] {
	background-image: 
		linear-gradient(rgba(17, 24, 39, 0.03) 1px, transparent 1px),
		linear-gradient(90deg, rgba(17, 24, 39, 0.03) 1px, transparent 1px);
	background-size: 40px 40px;
}

.dark .bg-grid-white\/\[0\.02\] {
	background-image: 
		linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
	background-size: 40px 40px;
}

/* Message animations */
.message-fade-enter-active,
.message-fade-leave-active {
	transition: all 0.3s ease;
}

.message-fade-enter-from {
	opacity: 0;
	transform: translateY(-10px);
}

.message-fade-leave-to {
	opacity: 0;
	transform: translateY(10px);
}

.message-animate {
	animation: messageFadeIn 0.4s ease-out;
}

@keyframes messageFadeIn {
	0% {
		opacity: 0;
		transform: translateY(-10px) scale(0.95);
	}
	100% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

/* Responsive adjustments */
@media (max-width: 1024px) {
	.feature-item {
		transform: none !important;
	}
}

@media (max-width: 640px) {
	.stagger-item {
		animation-delay: 0s !important;
	}
	
	.btn-animated::before {
		display: none;
	}
	
	.input-modern:focus-within {
		transform: none;
		box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.15);
	}
	
	.social-btn-hover:hover {
		transform: none;
	}
	
	.message-animate {
		animation: none;
	}
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
	.input-modern:focus-within {
		box-shadow: 0 12px 24px -8px rgba(96, 165, 250, 0.2);
	}
	
	.btn-animated:hover {
		box-shadow: 0 8px 20px -6px rgba(96, 165, 250, 0.5);
	}
	
	.logo-hover:hover {
		box-shadow: 0 20px 40px -10px rgba(255, 255, 255, 0.15);
	}
}
</style>