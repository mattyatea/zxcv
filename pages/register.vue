<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            sign in to your existing account
          </NuxtLink>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="username" class="label">Username</label>
            <input
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              autocomplete="username"
              required
              pattern="[a-zA-Z0-9_-]+"
              class="input"
              placeholder="johndoe"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only letters, numbers, underscores, and hyphens allowed
            </p>
          </div>
          
          <div>
            <label for="email" class="label">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="input"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label for="password" class="label">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              class="input"
              placeholder="••••••••"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be at least 8 characters long
            </p>
          </div>
          
          <div>
            <label for="confirmPassword" class="label">Confirm password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="input"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div class="flex items-center">
          <input
            id="agree-terms"
            v-model="form.agreeToTerms"
            name="agree-terms"
            type="checkbox"
            required
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="agree-terms" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            I agree to the
            <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Terms and Conditions</a>
          </label>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !form.agreeToTerms"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p class="text-sm text-red-800 dark:text-red-400">{{ error }}</p>
        </div>

        <div v-if="success" class="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <p class="text-sm text-green-800 dark:text-green-400">
            Account created successfully! Please check your email to verify your account.
          </p>
        </div>
      </form>
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
		error.value = "Passwords do not match";
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
		error.value = err.message || "Failed to create account";
	} finally {
		loading.value = false;
	}
};
</script>