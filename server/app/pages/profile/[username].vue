<template>
	<div class="container mx-auto max-w-4xl px-4 py-8">
		<!-- ローディング状態 -->
		<div v-if="loading" class="flex justify-center items-center min-h-[400px]">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>

		<!-- エラー状態 -->
		<div v-else-if="error" class="text-center py-8">
			<p class="text-red-600 mb-4">{{ error }}</p>
			<NuxtLink to="/" class="text-blue-600 hover:underline">{{ $t('profile.backToHome') }}</NuxtLink>
		</div>

		<!-- プロフィール表示 -->
		<div v-else-if="user">
			<!-- ヘッダー部分 -->
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-6">
				<div class="flex items-start justify-between">
					<div class="flex items-center space-x-4">
						<!-- アバター -->
						<div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
							{{ user.username.charAt(0).toUpperCase() }}
						</div>
						<div>
							<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ user.username }}</h1>
							<p class="text-gray-600 dark:text-gray-400">{{ user.email }}</p>
							<div class="flex items-center mt-2">
								<span
									v-if="user.emailVerified"
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
								>
									<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
									{{ $t('profile.emailVerified') }}
								</span>
								<span
									v-else
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
								>
									{{ $t('profile.emailNotVerified') }}
								</span>
							</div>
						</div>
					</div>
					<button
						v-if="isOwnProfile"
						@click="() => {
							console.log('Edit button clicked');
							errors.value = {};
							isEditing = true;
						}"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						{{ $t('profile.editProfile') }}
					</button>
				</div>
			</div>

			<!-- 統計情報 -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ $t('profile.createdRules') }}</h3>
					<p class="text-3xl font-bold text-blue-600">{{ stats.rulesCount || 0 }}</p>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ $t('profile.belongingOrganizations') }}</h3>
					<p class="text-3xl font-bold text-green-600">{{ stats.organizationsCount || 0 }}</p>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ $t('profile.registrationDate') }}</h3>
					<p class="text-lg text-gray-600 dark:text-gray-400">{{ formatDate(user.createdAt) }}</p>
				</div>
			</div>

			<!-- 最近のアクティビティ -->
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
				<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ $t('profile.recentActivity') }}</h2>
				<div v-if="recentRules.length > 0" class="space-y-4">
					<div v-for="rule in recentRules" :key="rule.id" class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
						<div class="flex justify-between items-start">
							<div>
								<NuxtLink
									:to="rule.organization ? `/rules/@${rule.organization.name}/${rule.name}` : `/rules/@${user.username}/${rule.name}`"
									class="text-lg font-medium text-blue-600 hover:underline"
								>
									{{ rule.name }}
								</NuxtLink>
								<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ rule.description }}</p>
							</div>
							<span class="text-sm text-gray-500 dark:text-gray-500">{{ formatDate(rule.updatedAt) }}</span>
						</div>
					</div>
				</div>
				<div v-else class="text-gray-500 dark:text-gray-400 text-center py-8">
					{{ $t('profile.noActivityYet') }}
				</div>
			</div>
		</div>

		<!-- プロフィール編集モーダル -->
		<CommonModal v-model="isEditing" :title="$t('profile.editProfile')" @close="cancelEdit">
			<form @submit.prevent="updateProfile" class="space-y-4">
				<!-- アバター編集セクション -->
				<div class="flex flex-col items-center mb-6">
					<div class="relative">
						<div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
							{{ editForm.username.charAt(0).toUpperCase() }}
						</div>
						<button
							type="button"
							class="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
							@click="showAvatarUpload = true"
							:title="$t('profile.changeAvatar')"
						>
							<svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
							</svg>
						</button>
					</div>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ $t('profile.avatarChangeComingSoon') }}</p>
				</div>

				<!-- ユーザー名 -->
				<div>
					<CommonInput
						v-model="editForm.username"
						:label="$t('profile.username')"
						:placeholder="$t('profile.placeholders.username')"
						:error="errors.username"
						required
						@blur="validateUsername"
					>
						<template #hint>
							<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ $t('profile.usernameHint') }}</p>
						</template>
					</CommonInput>
				</div>

				<!-- メールアドレス -->
				<div>
					<CommonInput
						v-model="editForm.email"
						type="email"
						:label="$t('profile.email')"
						:placeholder="$t('profile.placeholders.email')"
						:error="errors.email"
						required
						@blur="validateEmail"
					/>
					<div v-if="editForm.email !== user?.email" class="mt-2">
						<CommonBadge variant="warning" size="sm">
							<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
							</svg>
							{{ $t('profile.emailChangeWarning') }}
						</CommonBadge>
					</div>
				</div>

				<!-- パスワード変更リンク -->
				<div class="pt-4 border-t border-gray-200 dark:border-gray-700">
					<button
						type="button"
						@click="showPasswordChange = true"
						class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
					>
						{{ $t('profile.changePassword') }}
					</button>
				</div>

				<!-- エラーメッセージ -->
				<div v-if="updateError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
					<p class="text-sm text-red-600 dark:text-red-400">{{ updateError }}</p>
				</div>

				<!-- ボタン -->
				<div class="flex justify-end space-x-3 pt-4">
					<CommonButton
						type="button"
						variant="secondary"
						@click="cancelEdit"
					>
						{{ $t('common.cancel') }}
					</CommonButton>
					<CommonButton
						type="submit"
						:loading="updating"
						:disabled="!isFormValid || updating"
					>
						{{ $t('profile.update') }}
					</CommonButton>
				</div>
			</form>
		</CommonModal>

		<!-- パスワード変更モーダル -->
		<CommonModal v-model="showPasswordChange" :title="$t('profile.changePassword')" @close="showPasswordChange = false">
			<form @submit.prevent="changePassword" class="space-y-4">
				<CommonInput
					v-model="passwordForm.currentPassword"
					type="password"
					:label="$t('profile.currentPassword')"
					:placeholder="$t('profile.placeholders.currentPassword')"
					:error="passwordErrors.currentPassword"
					required
				/>
				<CommonInput
					v-model="passwordForm.newPassword"
					type="password"
					:label="$t('profile.newPassword')"
					:placeholder="$t('profile.placeholders.newPassword')"
					:error="passwordErrors.newPassword"
					required
					@blur="validateNewPassword"
				>
					<template #hint>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ $t('profile.passwordHint') }}</p>
					</template>
				</CommonInput>
				<CommonInput
					v-model="passwordForm.confirmPassword"
					type="password"
					:label="$t('profile.newPasswordConfirm')"
					:placeholder="$t('profile.placeholders.newPasswordConfirm')"
					:error="passwordErrors.confirmPassword"
					required
					@blur="validatePasswordConfirm"
				/>

				<div v-if="passwordError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
					<p class="text-sm text-red-600 dark:text-red-400">{{ passwordError }}</p>
				</div>

				<div class="flex justify-end space-x-3 pt-4">
					<CommonButton
						type="button"
						variant="secondary"
						@click="showPasswordChange = false"
					>
						{{ $t('common.cancel') }}
					</CommonButton>
					<CommonButton
						type="submit"
						:loading="changingPassword"
						:disabled="!isPasswordFormValid || changingPassword"
					>
						{{ $t('profile.change') }}
					</CommonButton>
				</div>
			</form>
		</CommonModal>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "~/composables/useToast";
import { useAuthStore } from "~/stores/auth";
import { useRpc } from "~/app/composables/useRpc";
import type { UserType, RuleType, GetUserByUsernameResponse } from "~/app/types/orpc";

const route = useRoute();
const $rpc = useRpc();
const { $t } = useNuxtApp();
const authStore = useAuthStore();
const { user: currentUser } = storeToRefs(authStore);

// Using types from orpc.ts
type UserProfile = GetUserByUsernameResponse;
type Rule = RuleType;

// State
const loading = ref(true);
const error = ref<string | null>(null);
const user = ref<UserProfile | null>(null);
const stats = ref({
	rulesCount: 0,
	organizationsCount: 0,
});
const recentRules = ref<Rule[]>([]);
const isEditing = ref(false);
const updating = ref(false);
const updateError = ref<string | null>(null);
const editForm = ref({
	username: "",
	email: "",
});
const errors = ref<Record<string, string>>({});

// Password change state
const showPasswordChange = ref(false);
const changingPassword = ref(false);
const passwordError = ref<string | null>(null);
const passwordForm = ref({
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
});
const passwordErrors = ref<Record<string, string>>({});

// Avatar upload state
const showAvatarUpload = ref(false);

// Computed
const isOwnProfile = computed(() => {
	return currentUser.value?.id === user.value?.id;
});

const isFormValid = computed(() => {
	const hasUsername = editForm.value.username.trim().length > 0;
	const hasEmail = editForm.value.email.trim().length > 0;
	const hasNoErrors = !errors.value.username && !errors.value.email;
	return hasUsername && hasEmail && hasNoErrors;
});

const isPasswordFormValid = computed(() => {
	return (
		passwordForm.value.currentPassword.length > 0 &&
		passwordForm.value.newPassword.length >= 8 &&
		passwordForm.value.confirmPassword.length > 0 &&
		Object.keys(passwordErrors.value).length === 0
	);
});

// Methods
const formatDate = (timestamp: number) => {
	const date = new Date(timestamp * 1000);
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

const loadProfile = async () => {
	try {
		loading.value = true;
		error.value = null;

		// Get username from route or use current user
		const username = (route.params.username as string) || currentUser.value?.username;

		if (!username) {
			error.value = $t("profile.errors.noUsername");
			return;
		}

		// Load user profile
		const profileData = await $rpc.users.getProfile({
			username,
		});

		user.value = profileData.user;
		stats.value = profileData.stats;
		recentRules.value = profileData.recentRules || [];

		// Set edit form initial values
		if (isOwnProfile.value && user.value) {
			editForm.value = {
				username: user.value.username,
				email: user.value.email,
			};
			// Clear any previous errors
			errors.value = {};
		}
	} catch (err: unknown) {
		console.error("Failed to load profile:", err);
		error.value = err instanceof Error ? err.message : $t("profile.errors.loadFailed");
	} finally {
		loading.value = false;
	}
};

// Validation methods
const validateUsername = () => {
	errors.value.username = "";
	const username = editForm.value.username.trim();

	if (!username) {
		errors.value.username = $t("profile.errors.usernameRequired");
	} else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
		errors.value.username = $t("profile.errors.usernameInvalid");
	} else if (username.length < 3) {
		errors.value.username = $t("profile.errors.usernameMinLength");
	}
};

const validateEmail = () => {
	errors.value.email = "";
	const email = editForm.value.email.trim();

	if (!email) {
		errors.value.email = $t("profile.errors.emailRequired");
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.value.email = $t("profile.errors.emailInvalid");
	}
};

const validateNewPassword = () => {
	passwordErrors.value.newPassword = "";
	if (passwordForm.value.newPassword.length < 8) {
		passwordErrors.value.newPassword = $t("profile.errors.passwordMinLength");
	}
};

const validatePasswordConfirm = () => {
	passwordErrors.value.confirmPassword = "";
	if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
		passwordErrors.value.confirmPassword = $t("profile.errors.passwordMismatch");
	}
};

const updateProfile = async () => {
	console.log("updateProfile called");
	console.log("isFormValid:", isFormValid.value);
	console.log("editForm:", editForm.value);
	console.log("errors:", errors.value);

	try {
		updating.value = true;
		updateError.value = null;

		// Validate before submitting
		validateUsername();
		validateEmail();

		if (!isFormValid.value) {
			console.log("Form is invalid, returning");
			return;
		}

		console.log("Calling API with:", {
			username: editForm.value.username.trim(),
			email: editForm.value.email.trim(),
		});

		const result = await $rpc.users.updateProfile({
			username: editForm.value.username.trim(),
			email: editForm.value.email.trim(),
		});

		console.log("API response:", result);

		// Update local state
		user.value = result.user;
		isEditing.value = false;

		// Update auth store if updating own profile
		if (isOwnProfile.value) {
			await authStore.updateUser(result.user);
		}

		// Show success message
		const { success } = useToast();
		success($t("profile.success.profileUpdated"));
	} catch (err: unknown) {
		console.error("Failed to update profile:", err);

		if (err instanceof Error) {
			if (err.message.includes("already in use")) {
				updateError.value = $t("profile.errors.usernameOrEmailTaken");
			} else {
				updateError.value = err.message || $t("profile.errors.updateFailed");
			}
		} else {
			updateError.value = $t("profile.errors.updateFailed");
		}
	} finally {
		updating.value = false;
	}
};

const cancelEdit = () => {
	isEditing.value = false;
	updateError.value = null;
	errors.value = {};
	// Reset form to original values
	if (user.value) {
		editForm.value = {
			username: user.value.username,
			email: user.value.email,
		};
	}
	console.log("cancelEdit - errors cleared:", errors.value);
};

const changePassword = async () => {
	try {
		changingPassword.value = true;
		passwordError.value = null;

		// Validate all fields
		validateNewPassword();
		validatePasswordConfirm();

		if (!isPasswordFormValid.value) {
			return;
		}

		await $rpc.users.changePassword({
			currentPassword: passwordForm.value.currentPassword,
			newPassword: passwordForm.value.newPassword,
		});

		// Reset form and close modal
		passwordForm.value = {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		};
		passwordErrors.value = {};
		showPasswordChange.value = false;

		// Show success message
		const { success } = useToast();
		success($t("profile.success.passwordChanged"));
	} catch (err: unknown) {
		console.error("Failed to change password:", err);

		if (err instanceof Error) {
			if (err.message.includes("incorrect") || err.message.includes("wrong")) {
				passwordError.value = $t("profile.errors.wrongCurrentPassword");
			} else {
				passwordError.value = err.message || $t("profile.errors.passwordChangeFailed");
			}
		} else {
			passwordError.value = $t("profile.errors.passwordChangeFailed");
		}
	} finally {
		changingPassword.value = false;
	}
};

// Lifecycle
onMounted(() => {
	loadProfile();
});
</script>