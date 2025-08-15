<template>
	<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
		<div class="max-w-md w-full space-y-8 p-8">
			<div class="text-center">
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ $t('device.title') }}</h1>
				<p class="mt-2 text-gray-600 dark:text-gray-400">{{ $t('device.description') }}</p>
			</div>

			<Card class="mt-8">
				<form @submit.prevent="handleSubmit" class="space-y-6">
					<div>
						<label for="code" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							{{ $t('device.codeLabel') }}
						</label>
						<div class="mt-1">
							<Input
								id="code"
								v-model="userCode"
								type="text"
								:placeholder="$t('device.codePlaceholder')"
								autocomplete="off"
								autofocus
								:error="errorMessage"
								class="text-center text-xl font-mono tracking-wider uppercase"
								maxlength="9"
								@input="formatCode"
							/>
						</div>
						<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
							{{ $t('device.codeHint') }}
						</p>
					</div>

					<div v-if="errorMessage" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm text-red-800 dark:text-red-200">{{ errorMessage }}</p>
							</div>
						</div>
					</div>

					<div v-if="successMessage" class="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm text-green-800 dark:text-green-200">{{ successMessage }}</p>
							</div>
						</div>
					</div>

					<Button
						type="submit"
						:loading="loading"
						:disabled="!isValidCode || loading || !!successMessage"
						class="w-full"
					>
						{{ $t('device.submit') }}
					</Button>
				</form>
			</Card>

			<div class="text-center">
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{{ $t('device.notYourDevice') }}
					<nuxt-link to="/" class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
						{{ $t('device.cancelLink') }}
					</nuxt-link>
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useNuxtApp } from '#app';
import { useAuthStore } from '~/stores/auth';
import { useI18n } from '~/composables/useI18n';
import Card from '~/components/common/Card.vue';
import Input from '~/components/common/Input.vue';
import Button from '~/components/common/Button.vue';

const { $rpc } = useNuxtApp();
const { $t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();

const userCode = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Check if user is authenticated
onMounted(() => {
	if (!authStore.isAuthenticated) {
		navigateTo('/login?redirect=/device');
	}
	
	// Pre-fill code from URL if provided
	const code = route.query.code as string;
	if (code) {
		userCode.value = code.toUpperCase();
	}
});

// Format code with dash
const formatCode = () => {
	let value = userCode.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
	if (value.length > 4) {
		value = value.slice(0, 4) + '-' + value.slice(4, 8);
	}
	userCode.value = value;
};

// Validate code format
const isValidCode = computed(() => {
	const code = userCode.value.replace(/-/g, '');
	return code.length === 8 && /^[A-Z0-9]+$/.test(code);
});

const handleSubmit = async () => {
	if (!isValidCode.value || loading.value || !authStore.isAuthenticated) return;

	loading.value = true;
	errorMessage.value = '';
	successMessage.value = '';

	try {
		const response = await $rpc.auth.deviceVerify({
			userCode: userCode.value,
		});

		if (response.success) {
			successMessage.value = response.message || $t('device.success');
			// Navigate after showing success message (client-side only)
			if (typeof window !== 'undefined') {
				// Use a simple delay mechanism that doesn't rely on setTimeout
				const startTime = Date.now();
				const checkTime = () => {
					if (Date.now() - startTime >= 3000) {
						navigateTo('/');
					} else {
						requestAnimationFrame(checkTime);
					}
				};
				requestAnimationFrame(checkTime);
			}
		}
	} catch (error: unknown) {
		console.error('Device verification error:', error);
		const err = error as { code?: string; message?: string };
		if (err.code === 'NOT_FOUND') {
			errorMessage.value = $t('device.invalidCode');
		} else if (err.code === 'BAD_REQUEST' && err.message?.includes('期限')) {
			errorMessage.value = $t('device.expiredCode');
		} else {
			errorMessage.value = $t('device.error');
		}
	} finally {
		loading.value = false;
	}
};
</script>