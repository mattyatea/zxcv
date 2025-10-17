<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- ローディング -->
      <div v-if="loading" class="text-center">
        <CommonLoadingSpinner size="lg" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">{{ t('organizations.join.verifying') }}</p>
      </div>

      <!-- エラー -->
      <div v-else-if="error" class="text-center">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ t('organizations.join.failed') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error }}</p>
        <NuxtLink to="/organizations">
          <CommonButton variant="primary">
            {{ t('organizations.join.backToOrganizations') }}
          </CommonButton>
        </NuxtLink>
      </div>

      <!-- 成功 -->
      <div v-else-if="success" class="text-center">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ t('organizations.join.joined') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ organization?.displayName || organization?.name }} {{ t('organizations.join.welcome') }}
        </p>
        <NuxtLink :to="`/organizations/${organization?.id}`">
          <CommonButton variant="primary">
            {{ t('organizations.join.goToOrganization') }}
          </CommonButton>
        </NuxtLink>
      </div>

      <!-- 未ログイン -->
      <div v-else-if="!isAuthenticated" class="text-center">
        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ t('organizations.join.loginRequired') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ t('organizations.join.loginToJoin') }}
        </p>
        <NuxtLink :to="`/login?redirect=/organizations/join?token=${token}`">
          <CommonButton variant="primary">
            {{ t('organizations.join.login') }}
          </CommonButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRpc } from "~/composables/useRpc";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";
import type { AcceptInvitationResponse } from "~/types/orpc";

// Using types from orpc.ts - AcceptInvitationResponse contains organization with all required fields
type Organization = AcceptInvitationResponse["organization"];

const { t } = useI18n();
const route = useRoute();
const $rpc = useRpc();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const { error: toastError } = useToast();

const loading = ref(false);
const error = ref("");
const success = ref(false);
const organization = ref<Organization | null>(null);
const token = computed(() => route.query.token as string);

const acceptInvitation = async () => {
	if (!token.value) {
		error.value = t("organizations.join.noToken");
		return;
	}

	loading.value = true;
	error.value = "";

	try {
		const response = await $rpc.organizations.acceptInvitation({
			token: token.value,
		});

		success.value = true;
		organization.value = response.organization;
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : t("organizations.join.failed");
		error.value = errorMessage;
		toastError(errorMessage);
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	if (isAuthenticated.value && token.value) {
		acceptInvitation();
	}
});

// Watch for authentication changes
watch(isAuthenticated, (newValue) => {
	if (newValue && token.value && !success.value && !error.value) {
		acceptInvitation();
	}
});
</script>