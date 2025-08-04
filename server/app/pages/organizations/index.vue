<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="container-lg py-8">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="heading-1 mb-2">{{ $t('organizations.title') }}</h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('organizations.subtitle') }}
          </p>
        </div>
        <NuxtLink to="/organizations/new">
          <CommonButton variant="primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ $t('organizations.createOrganization') }}
          </CommonButton>
        </NuxtLink>
      </div>

      <!-- チーム一覧 -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="card">
          <div class="skeleton h-6 w-3/4 mb-3"></div>
          <div class="skeleton h-4 w-full mb-2"></div>
          <div class="skeleton h-4 w-2/3"></div>
        </div>
      </div>

      <div v-else-if="organizations.length === 0" class="text-center py-12">
        <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {{ $t('organizations.noOrganizations') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ $t('organizations.createFirstOrganization') }}
        </p>
        <NuxtLink to="/organizations/new">
          <CommonButton variant="primary">
            {{ $t('organizations.createOrganization') }}
          </CommonButton>
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="organization in organizations"
          :key="organization.id"
          :to="`/organizations/${organization.id}`"
          class="card-hover group"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
              {{ organization.name[0].toUpperCase() }}
            </div>
            <span class="badge badge-primary">
              {{ organization.role }}
            </span>
          </div>
          
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {{ organization.name }}
          </h3>
          
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {{ organization.description || $t('organizations.noDescription') }}
          </p>
          
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center space-x-4">
              <span class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {{ organization.memberCount }} {{ $t('organizations.members') }}
              </span>
              <span class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {{ organization.ruleCount }} {{ $t('organizations.rules') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";
import { useRpc } from "~/composables/useRpc";
import type { OrganizationType, GetOrganizationsResponse } from "~/types/orpc";

definePageMeta({
	middleware: "auth",
});

// Using types from orpc.ts
type Organization = OrganizationType;

const { t } = useI18n();
const loading = ref(false);
const organizations = ref<Organization[]>([]);

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { error: toastError } = useToast();

const $rpc = useRpc();

const fetchOrganizations = async () => {
	loading.value = true;
	try {
		const data = await $rpc.organizations.list();

		// APIレスポンスをページで使用する形式に変換
		organizations.value = data.map((organization) => ({
			id: organization.id,
			name: organization.displayName || organization.name,
			description: "", // APIにdescriptionフィールドがないため空文字
			role: organization.owner.id === user.value?.id ? "owner" : "member",
			memberCount: organization.memberCount,
			ruleCount: organization.ruleCount || 0,
			createdAt: organization.createdAt
				? new Date(organization.createdAt * 1000).toISOString()
				: new Date().toISOString(),
		}));
	} catch (error) {
		console.error("Failed to fetch organizations:", error);
		toastError(t("organizations.messages.fetchError"));
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	fetchOrganizations();
});
</script>