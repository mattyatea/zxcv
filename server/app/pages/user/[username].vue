<template>
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
		<div class="container mx-auto px-4 py-8">
			<!-- Loading state -->
			<div v-if="loading" class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>

			<!-- Error state -->
			<div v-else-if="error" class="text-center py-12">
				<h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{{ t('profile.userNotFound') }}</h2>
				<p class="text-gray-600 dark:text-gray-400">{{ t('profile.userNotFoundDesc') }}</p>
			</div>

			<!-- User profile -->
			<div v-else-if="profileData" class="max-w-6xl mx-auto">
				<!-- Profile header -->
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
					<div class="flex items-start justify-between">
						<div class="flex items-center space-x-4">
							<!-- アバター -->
							<div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
								{{ profileData.user.username.charAt(0).toUpperCase() }}
							</div>
							<div>
								<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
									{{ profileData.user.username }}
								</h1>
								<div class="flex items-center gap-6 text-gray-600 dark:text-gray-400">
									<div class="flex items-center gap-2">
										<Icon name="ph:calendar" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
										<span>{{ t('profile.registeredDate') }}: {{ formatDate(profileData.user.createdAt) }}</span>
									</div>
								</div>
								<!-- Email and verification status (only show for own profile) -->
								<div v-if="isOwnProfile && authStore.user" class="mt-2">
									<p class="text-gray-600 dark:text-gray-400">{{ authStore.user.email }}</p>
									<div class="flex items-center mt-1">
										<span
											v-if="authStore.user.emailVerified"
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
										>
											<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											</svg>
											{{ t('profile.emailVerified') }}
										</span>
										<span
											v-else
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
										>
											{{ t('profile.emailNotVerified') }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Stats -->
					<div class="grid grid-cols-2 gap-4 mt-6">
						<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
							<div class="text-3xl font-bold text-gray-900 dark:text-white">{{ profileData.stats.publicRulesCount }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">{{ t('profile.publicRules') }}</div>
						</div>
						<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
							<div class="text-3xl font-bold text-gray-900 dark:text-white">{{ profileData.stats.totalStars }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">{{ t('profile.totalStars') }}</div>
						</div>
					</div>
				</div>

				<!-- Public rules -->
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ t('profile.publicRules') }}</h2>
					
					<div v-if="profileData.publicRules.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
						{{ t('profile.noPublicRules') }}
					</div>
					
					<div v-else class="space-y-4">
						<div
							v-for="rule in profileData.publicRules"
							:key="rule.id"
							class="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
						>
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<NuxtLink
										:to="`/rules/${rule.organization ? `@${rule.organization.name}/` : ''}${rule.name}`"
										class="text-lg font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
									>
										{{ rule.organization ? `@${rule.organization.name}/` : '' }}{{ rule.name }}
									</NuxtLink>
									<p class="text-gray-600 dark:text-gray-400 mt-1">{{ rule.description }}</p>
									<div class="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
										<div class="flex items-center gap-1">
											<Icon name="ph:star" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
											<span>{{ rule.stars }}</span>
										</div>
										<span>{{ t('common.updatedAt') }}: {{ formatDate(rule.updatedAt) }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRpc } from "~/composables/useRpc";
import { useAuthStore } from "~/stores/auth";
import { useI18n } from "~/composables/useI18n";
import type { InferOutput } from "@orpc/contract";
import type { contract } from "~/server/orpc/contracts";

type UserPublicProfile = InferOutput<typeof contract.users.getPublicProfile>;

const route = useRoute();
const $rpc = useRpc();
const authStore = useAuthStore();
const { t } = useI18n();

const username = computed(() => route.params.username as string);
const loading = ref(true);
const error = ref(false);

// Check if viewing own profile
const isOwnProfile = computed(() => {
	return authStore.user?.username === username.value;
});

const profileData = ref<UserPublicProfile | null>(null);

// Fetch user profile
async function fetchProfile() {
	try {
		loading.value = true;
		error.value = false;
		const response = await $rpc.users.getPublicProfile({
			username: username.value,
		});
		profileData.value = response;
	} catch (err) {
		console.error("Failed to fetch user profile:", err);
		error.value = true;
	} finally {
		loading.value = false;
	}
}

// Format date
function formatDate(timestamp: number) {
	return new Date(timestamp * 1000).toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

// Set page meta
useHead({
	title: () =>
		profileData.value ? `${profileData.value.user.username} - zxcv` : `${t('profile.userProfile')} - zxcv`,
});

// Fetch on mount
onMounted(() => {
	fetchProfile();
});
</script>