<template>
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
		<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
			<div class="bg-white dark:bg-gray-800 shadow">
				<div class="px-4 py-5 sm:p-6">
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ t('settings.title') }}</h1>

					<!-- Tab Navigation -->
					<div class="border-b border-gray-200 dark:border-gray-700">
						<nav class="-mb-px flex space-x-8">
							<button
								v-for="tab in tabs"
								:key="tab.id"
								@click="activeTab = tab.id"
								:class="[
									'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
									activeTab === tab.id
										? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
										: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
								]"
							>
								{{ tab.name }}
							</button>
						</nav>
					</div>

					<!-- Tab Content -->
					<div class="mt-6">
						<!-- Profile Tab -->
						<div v-if="activeTab === 'profile'" class="space-y-6">
							<ProfileEditForm
								:user="userProfile"
								:loading="loading"
								@update="handleProfileUpdate"
								@upload-avatar="handleAvatarUpload"
							/>
						</div>

						<!-- Account Tab -->
						<div v-else-if="activeTab === 'account'" class="space-y-6">
							<div class="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
								<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
									{{ t('settings.account.title') }}
								</h3>
								<!-- Account settings content will be added here -->
								<p class="text-gray-500 dark:text-gray-400">{{ t('settings.account.placeholder') }}</p>
							</div>
						</div>

						<!-- Security Tab -->
						<div v-else-if="activeTab === 'security'" class="space-y-6">
							<div class="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
								<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
									{{ t('settings.security.title') }}
								</h3>
								<!-- Security settings content will be added here -->
								<p class="text-gray-500 dark:text-gray-400">{{ t('settings.security.placeholder') }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ProfileEditForm from "~/components/settings/ProfileEditForm.vue";
import { useRpc } from "~/composables/useRpc";
import { useToast } from "~/composables/useToast";
import type { MeResponse } from "~/types/orpc";

// Meta tags
definePageMeta({
	middleware: "auth",
	title: "Settings",
});

// Composables
const $rpc = useRpc();
const { t } = useI18n();
const { showToast } = useToast();

// Reactive data
const activeTab = ref("profile");
const loading = ref(false);
const userProfile = ref<MeResponse | null>(null);

// Tab configuration
const tabs = computed(() => [
	{ id: "profile", name: t("settings.tabs.profile") },
	{ id: "account", name: t("settings.tabs.account") },
	{ id: "security", name: t("settings.tabs.security") },
]);

// Fetch user profile
const fetchUserProfile = async () => {
	try {
		loading.value = true;
		const response = await $rpc.users.me();
		userProfile.value = response;
	} catch (error) {
		showToast({
			message: t("settings.error.fetchProfile"),
			type: "error",
		});
	} finally {
		loading.value = false;
	}
};

// Handle profile update
const handleProfileUpdate = async (profileData: {
	displayName?: string | null;
	bio?: string | null;
	location?: string | null;
	website?: string | null;
}) => {
	try {
		loading.value = true;
		// Filter out null values and convert to undefined
		const filteredData = Object.fromEntries(
			Object.entries(profileData).map(([key, value]) => [
				key,
				value === null ? undefined : value,
			]),
		) as {
			displayName?: string;
			bio?: string;
			location?: string;
			website?: string;
		};
		const response = await $rpc.users.updateProfile(filteredData);
		userProfile.value = response.user;

		// Update auth store user info as well
		const authStore = useAuthStore();
		authStore.updateUser({
			displayName: response.user.displayName,
		});

		showToast({
			message: t("settings.success.profileUpdated"),
			type: "success",
		});
	} catch (error) {
		showToast({
			message: t("settings.error.updateProfile"),
			type: "error",
		});
	} finally {
		loading.value = false;
	}
};

// Handle avatar upload
const handleAvatarUpload = async (file: File) => {
	try {
		loading.value = true;

		// Convert file to base64
		const base64 = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				// Remove data URL prefix (e.g., "data:image/jpeg;base64,")
				const base64Data = result.split(",")[1];
				if (!base64Data) {
					reject(new Error("Failed to convert image to base64"));
					return;
				}
				resolve(base64Data);
			};
			reader.onerror = (error) => {
				reject(error);
			};
			reader.readAsDataURL(file);
		});

		const response = await $rpc.users.uploadAvatar({
			image: base64,
			filename: file.name,
		});

		// Update user profile with new avatar URL
		if (userProfile.value) {
			userProfile.value.avatarUrl = response.avatarUrl;
		}

		// Update auth store user info as well
		const authStore = useAuthStore();
		authStore.updateUser({ avatarUrl: response.avatarUrl });

		showToast({
			message: t("settings.success.avatarUploaded"),
			type: "success",
		});
	} catch (error: unknown) {
		// Extract error message if available
		const errorMessage =
			(error && typeof error === "object" && "message" in error
				? (error as { message: string }).message
				: null) ||
			(error &&
			typeof error === "object" &&
			"data" in error &&
			error.data &&
			typeof error.data === "object" &&
			"message" in error.data
				? (error.data as { message: string }).message
				: null) ||
			t("settings.error.uploadAvatar");

		showToast({
			message: errorMessage,
			type: "error",
		});
	} finally {
		loading.value = false;
	}
};

// Lifecycle hooks
onMounted(() => {
	fetchUserProfile();
});
</script>
