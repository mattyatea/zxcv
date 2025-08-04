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
          {{ $t('auth.register.title') }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 stagger-item stagger-3">
          {{ $t('auth.register.subtitle') }}
          <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
            {{ $t('nav.login') }}
          </NuxtLink>
        </p>
      </div>

      <!-- Register Form -->
      <CommonCard padding="lg" class="shadow-xl border-0 stagger-item stagger-4">
        <form class="space-y-6" @submit="handleRegister">
          <div class="space-y-4">
            <CommonInput
              v-model="form.username"
              type="text"
              :label="$t('auth.register.username')"
              :placeholder="$t('placeholders.username')"
              :hint="$t('auth.register.usernameHint')"
              required
              pattern="[a-zA-Z0-9_-]+"
              size="lg"
              :error="errors.username"
              class="stagger-item stagger-5"
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
              :label="$t('auth.register.email')"
              :placeholder="$t('placeholders.email')"
              required
              size="lg"
              :error="errors.email"
              class="stagger-item stagger-6"
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
              :label="$t('auth.register.password')"
              placeholder="••••••••"
              :hint="$t('auth.register.passwordHint')"
              required
              size="lg"
              :error="errors.password"
              @input="checkPasswordStrength"
              class="stagger-item stagger-7"
            >
              <template #prefix>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </template>
            </CommonInput>

            <!-- Password Strength Indicator -->
            <div v-if="form.password" class="space-y-1 stagger-item stagger-8">
              <div class="flex gap-1">
                <div 
                  v-for="i in 4" 
                  :key="i"
                  class="flex-1 h-1 rounded-full transition-all duration-300"
                  :class="i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200 dark:bg-gray-700'"
                />
              </div>
              <p class="text-xs" :class="strengthTextColors[passwordStrength]">
                {{ strengthTexts[passwordStrength] }}
              </p>
            </div>

            <CommonInput
              v-model="form.confirmPassword"
              type="password"
              :label="$t('auth.register.confirmPassword')"
              placeholder="••••••••"
              required
              size="lg"
              :error="errors.confirmPassword"
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
              class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
              <a href="/terms" target="_blank" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">{{ $t('auth.register.agreeToTerms') }}</a>
              {{ $t('auth.register.and') }}
              <a href="/privacy" target="_blank" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">{{ $t('auth.register.privacyPolicy') }}</a>
              {{ $t('auth.register.agreeToTermsText') }}
            </span>
          </label>

          <CommonButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            :loading="loading"
            :disabled="!form.agreeToTerms || loading"
          >
            {{ loading ? $t('auth.register.registering') : $t('auth.register.registerButton') }}
          </CommonButton>
        </form>

        <!-- Error Message -->
        <Transition name="fade">
          <div v-if="error" class="rounded-lg bg-danger/10 border border-danger/20 p-4 mt-4">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-danger flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-danger">{{ error }}</p>
            </div>
          </div>
        </Transition>

        <!-- Success Message -->
        <Transition name="fade">
          <div v-if="message" class="rounded-lg bg-success/10 border border-success/20 p-4 mt-4">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-success">{{ message }}</p>
            </div>
          </div>
        </Transition>

        <!-- Divider -->
        <div class="relative mt-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white dark:bg-gray-800 text-gray-500">{{ $t('common.or') }}</span>
          </div>
        </div>

        <!-- Social Login -->
        <div class="grid grid-cols-2 gap-3 mt-6">
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
            {{ $t('common.providers.google') }}
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
            {{ $t('common.providers.github') }}
          </button>
        </div>
      </CommonCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "~/composables/useToast";
import { useRpc } from "~/app/composables/useRpc";

definePageMeta({
	layout: "default",
});

const { t } = useI18n();

useHead({
	title: t("auth.register.pageTitle"),
});

const { error: toastError, success: toastSuccess } = useToast();
const $rpc = useRpc();

// Form state
const form = ref({
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
	agreeToTerms: false,
});

// Error state
const errors = ref({
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
});

const loading = ref(false);
const error = ref("");
const message = ref("");

// Password strength
const passwordStrength = ref(0);
const strengthColors = ["", "bg-danger", "bg-warning", "bg-info", "bg-success"];
const strengthTextColors = ["", "text-danger", "text-warning", "text-info", "text-success"];
const strengthTexts = computed(() => [
	"",
	t("auth.register.passwordStrength.weak"),
	t("auth.register.passwordStrength.fair"),
	t("auth.register.passwordStrength.good"),
	t("auth.register.passwordStrength.strong"),
]);

// Check password strength
const checkPasswordStrength = () => {
	const password = form.value.password;
	let strength = 0;

	if (password.length >= 8) {
		strength++;
	}
	if (password.length >= 12) {
		strength++;
	}
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
		strength++;
	}
	if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
		strength++;
	}

	passwordStrength.value = strength;
};

// Clear error for specific field
const clearError = (field: keyof typeof errors.value) => {
	errors.value[field] = "";
};

// Watch form changes to clear errors
watch(
	() => form.value.username,
	() => clearError("username"),
);
watch(
	() => form.value.email,
	() => clearError("email"),
);
watch(
	() => form.value.password,
	() => clearError("password"),
);
watch(
	() => form.value.confirmPassword,
	() => clearError("confirmPassword"),
);

// Validate form
const validateForm = () => {
	let isValid = true;
	errors.value = {
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	};

	// Username validation
	if (!form.value.username) {
		errors.value.username = t("auth.register.validation.usernameRequired");
		isValid = false;
	} else if (!/^[a-zA-Z0-9_-]+$/.test(form.value.username)) {
		errors.value.username = t("auth.register.validation.usernamePattern");
		isValid = false;
	} else if (form.value.username.length < 3) {
		errors.value.username = t("auth.register.validation.usernameLength");
		isValid = false;
	}

	// Email validation
	if (!form.value.email) {
		errors.value.email = t("auth.register.validation.emailRequired");
		isValid = false;
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
		errors.value.email = t("auth.register.validation.emailInvalid");
		isValid = false;
	}

	// Password validation
	if (!form.value.password) {
		errors.value.password = t("auth.register.validation.passwordRequired");
		isValid = false;
	} else if (form.value.password.length < 8) {
		errors.value.password = t("auth.register.validation.passwordLength");
		isValid = false;
	}

	// Confirm password validation
	if (!form.value.confirmPassword) {
		errors.value.confirmPassword = t("auth.register.validation.passwordRequired");
		isValid = false;
	} else if (form.value.password !== form.value.confirmPassword) {
		errors.value.confirmPassword = t("auth.register.validation.passwordMismatch");
		isValid = false;
	}

	return isValid;
};

const handleRegister = async (event: Event) => {
	event.preventDefault();

	if (!validateForm()) {
		return;
	}

	loading.value = true;
	error.value = "";
	message.value = "";

	try {
		await $rpc.auth.register({
			username: form.value.username,
			email: form.value.email,
			password: form.value.password,
		});

		message.value = t("auth.register.accountCreated");
		toastSuccess(t("auth.register.accountCreatedShort"));

		// Clear form
		form.value = {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
			agreeToTerms: false,
		};

		// Redirect to login after 3 seconds
		setTimeout(() => {
			navigateTo("/login");
		}, 3000);
	} catch (err) {
		error.value = err.message || t("auth.register.errors.generalError");
		toastError(err.message || t("auth.register.errors.generalError"));
	} finally {
		loading.value = false;
	}
};

const handleSocialLogin = async (provider: string) => {
	if (!form.value.agreeToTerms) {
		toastError(t("auth.register.errors.termsRequired"));
		return;
	}

	loading.value = true;
	error.value = "";

	try {
		const response = await $rpc.auth.oauthInitialize({
			provider,
			redirectUrl: "/rules",
			action: "register",
		});

		window.location.href = response.authorizationUrl;
	} catch (err) {
		error.value = err.message || t("errors.oauth.registrationFailed", { provider });
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