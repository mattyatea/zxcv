<template>
  <div class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and Title -->
      <div class="text-center">
        <div class="flex justify-center mb-6 stagger-item stagger-1">
          <div class="w-16 h-16 bg-primary-600 dark:bg-primary-500 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300">
            <span class="text-3xl font-bold text-white">Z</span>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white stagger-item stagger-2">
          {{ t('auth.register.title') }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 stagger-item stagger-3">
          {{ t('auth.register.subtitle') }}
          <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
            {{ t('nav.login') }}
          </NuxtLink>
        </p>
      </div>

      <!-- Register Form -->
      <CommonCard padding="lg" class="shadow-xl border-0 stagger-item stagger-4">
        <!-- Notice -->
        <div class="rounded-lg bg-info/10 border border-info/20 p-4 mb-6">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-info flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <p class="text-sm text-info font-medium">Sign up with Google or GitHub</p>
              <p class="text-xs text-info/80 mt-1">Email registration is currently disabled. Please use one of the providers below to create your account.</p>
            </div>
          </div>
        </div>

        <label class="flex items-start mb-6">
          <input
            v-model="form.agreeToTerms"
            type="checkbox"
            required
            class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
            <a href="/terms" target="_blank" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">{{ t('auth.register.agreeToTerms') }}</a>
            {{ t('auth.register.and') }}
            <a href="/privacy" target="_blank" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">{{ t('auth.register.privacyPolicy') }}</a>
            {{ t('auth.register.agreeToTermsText') }}
          </span>
        </label>

        <!-- Error Message -->
        <Transition name="fade">
          <div v-if="error" class="rounded-lg bg-danger/10 border border-danger/20 p-4 mb-4">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-danger flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-danger">{{ error }}</p>
            </div>
          </div>
        </Transition>

        <!-- Social Login -->
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="btn btn-secondary btn-md justify-center"
            @click="handleSocialLogin('google')"
            :disabled="loading || !form.agreeToTerms"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {{ t('common.providers.google') }}
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-md justify-center"
            @click="handleSocialLogin('github')"
            :disabled="loading || !form.agreeToTerms"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {{ t('common.providers.github') }}
          </button>
        </div>
      </CommonCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "~/composables/useToast";
import { useRpc } from "~/composables/useRpc";

definePageMeta({
	layout: "default",
});

const { t } = useI18n();

useHead({
	title: t("auth.register.pageTitle"),
});

const { error: toastError, success: toastSuccess } = useToast();
const $rpc = useRpc();

// Form state (simplified - only for OAuth)
const form = ref({
	agreeToTerms: false,
});

const loading = ref(false);
const error = ref("");

const handleSocialLogin = async (provider: string) => {
	if (!form.value.agreeToTerms) {
		toastError(t("auth.register.errors.termsRequired"));
		return;
	}

	loading.value = true;
	error.value = "";

	try {
		const response = await $rpc.auth.oauthInitialize({
			provider: provider as "github" | "google",
			redirectUrl: "/rules",
			action: "register",
		});

		window.location.href = response.authorizationUrl;
	} catch (err) {
		const errorMessage = err && typeof err === 'object' && 'message' in err
			? (err as { message?: string }).message
			: undefined;
		error.value = errorMessage || t("errors.oauth.registrationFailed", { provider });
		loading.value = false;
	}
};
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
	transition: all 0.3s ease;
}

.fade-enter-from {
	opacity: 0;
	transform: translateY(-10px);
}

.fade-leave-to {
	opacity: 0;
	transform: translateY(10px);
}
</style>