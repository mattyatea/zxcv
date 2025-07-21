<template>
	<div class="container mx-auto max-w-4xl px-4 py-8">
		<!-- ローディング状態 -->
		<div v-if="loading" class="flex justify-center items-center min-h-[400px]">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>

		<!-- エラー状態 -->
		<div v-else-if="error" class="text-center py-8">
			<p class="text-red-600 mb-4">{{ error }}</p>
			<NuxtLink to="/" class="text-blue-600 hover:underline">ホームに戻る</NuxtLink>
		</div>

		<!-- プロフィール表示 -->
		<div v-else-if="user">
			<!-- ヘッダー部分 -->
			<div class="bg-white rounded-lg shadow-md p-6 mb-6">
				<div class="flex items-start justify-between">
					<div class="flex items-center space-x-4">
						<!-- アバター -->
						<div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
							{{ user.username.charAt(0).toUpperCase() }}
						</div>
						<div>
							<h1 class="text-2xl font-bold text-gray-900">{{ user.username }}</h1>
							<p class="text-gray-600">{{ user.email }}</p>
							<div class="flex items-center mt-2">
								<span
									v-if="user.emailVerified"
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
								>
									<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
									メール認証済み
								</span>
								<span
									v-else
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
								>
									メール未認証
								</span>
							</div>
						</div>
					</div>
					<button
						v-if="isOwnProfile"
						@click="isEditing = true"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						プロフィールを編集
					</button>
				</div>
			</div>

			<!-- 統計情報 -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div class="bg-white rounded-lg shadow-md p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-2">作成したルール</h3>
					<p class="text-3xl font-bold text-blue-600">{{ stats.rulesCount || 0 }}</p>
				</div>
				<div class="bg-white rounded-lg shadow-md p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-2">所属組織</h3>
					<p class="text-3xl font-bold text-green-600">{{ stats.organizationsCount || 0 }}</p>
				</div>
				<div class="bg-white rounded-lg shadow-md p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-2">登録日</h3>
					<p class="text-lg text-gray-600">{{ formatDate(user.createdAt) }}</p>
				</div>
			</div>

			<!-- 最近のアクティビティ -->
			<div class="bg-white rounded-lg shadow-md p-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">最近のアクティビティ</h2>
				<div v-if="recentRules.length > 0" class="space-y-4">
					<div v-for="rule in recentRules" :key="rule.id" class="border-b border-gray-200 pb-4 last:border-0">
						<div class="flex justify-between items-start">
							<div>
								<NuxtLink
									:to="`/rules/${rule.name}`"
									class="text-lg font-medium text-blue-600 hover:underline"
								>
									{{ rule.name }}
								</NuxtLink>
								<p class="text-sm text-gray-600 mt-1">{{ rule.description }}</p>
							</div>
							<span class="text-sm text-gray-500">{{ formatDate(rule.updatedAt) }}</span>
						</div>
					</div>
				</div>
				<div v-else class="text-gray-500 text-center py-8">
					まだアクティビティがありません
				</div>
			</div>
		</div>

		<!-- プロフィール編集モーダル -->
		<CommonModal v-model="isEditing" title="プロフィールを編集" @close="cancelEdit">
			<form @submit.prevent="updateProfile" class="space-y-4">
				<!-- アバター編集セクション -->
				<div class="flex flex-col items-center mb-6">
					<div class="relative">
						<div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
							{{ editForm.username.charAt(0).toUpperCase() }}
						</div>
						<button
							type="button"
							class="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
							@click="showAvatarUpload = true"
							title="アバターを変更"
						>
							<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
							</svg>
						</button>
					</div>
					<p class="text-sm text-gray-500 mt-2">アバター画像の変更は近日実装予定</p>
				</div>

				<!-- ユーザー名 -->
				<div>
					<CommonInput
						v-model="editForm.username"
						label="ユーザー名"
						placeholder="username"
						:error="errors.username"
						required
						@blur="validateUsername"
					>
						<template #hint>
							<p class="text-xs text-gray-500 mt-1">英数字、ハイフン、アンダースコアのみ使用可能</p>
						</template>
					</CommonInput>
				</div>

				<!-- メールアドレス -->
				<div>
					<CommonInput
						v-model="editForm.email"
						type="email"
						label="メールアドレス"
						placeholder="email@example.com"
						:error="errors.email"
						required
						@blur="validateEmail"
					/>
					<div v-if="editForm.email !== user?.email" class="mt-2">
						<CommonBadge variant="warning" size="sm">
							<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
							</svg>
							メールアドレスを変更すると再認証が必要になります
						</CommonBadge>
					</div>
				</div>

				<!-- パスワード変更リンク -->
				<div class="pt-4 border-t border-gray-200">
					<button
						type="button"
						@click="showPasswordChange = true"
						class="text-sm text-blue-600 hover:text-blue-700 font-medium"
					>
						パスワードを変更
					</button>
				</div>

				<!-- エラーメッセージ -->
				<div v-if="updateError" class="p-3 bg-red-50 border border-red-200 rounded-md">
					<p class="text-sm text-red-600">{{ updateError }}</p>
				</div>

				<!-- ボタン -->
				<div class="flex justify-end space-x-3 pt-4">
					<CommonButton
						type="button"
						variant="secondary"
						@click="cancelEdit"
					>
						キャンセル
					</CommonButton>
					<CommonButton
						type="submit"
						:loading="updating"
						:disabled="!isFormValid || updating"
					>
						更新
					</CommonButton>
				</div>
			</form>
		</CommonModal>

		<!-- パスワード変更モーダル -->
		<CommonModal v-model="showPasswordChange" title="パスワードを変更" @close="showPasswordChange = false">
			<form @submit.prevent="changePassword" class="space-y-4">
				<CommonInput
					v-model="passwordForm.currentPassword"
					type="password"
					label="現在のパスワード"
					placeholder="現在のパスワードを入力"
					:error="passwordErrors.currentPassword"
					required
				/>
				<CommonInput
					v-model="passwordForm.newPassword"
					type="password"
					label="新しいパスワード"
					placeholder="新しいパスワードを入力"
					:error="passwordErrors.newPassword"
					required
					@blur="validateNewPassword"
				>
					<template #hint>
						<p class="text-xs text-gray-500 mt-1">8文字以上で設定してください</p>
					</template>
				</CommonInput>
				<CommonInput
					v-model="passwordForm.confirmPassword"
					type="password"
					label="新しいパスワード（確認）"
					placeholder="新しいパスワードを再入力"
					:error="passwordErrors.confirmPassword"
					required
					@blur="validatePasswordConfirm"
				/>

				<div v-if="passwordError" class="p-3 bg-red-50 border border-red-200 rounded-md">
					<p class="text-sm text-red-600">{{ passwordError }}</p>
				</div>

				<div class="flex justify-end space-x-3 pt-4">
					<CommonButton
						type="button"
						variant="secondary"
						@click="showPasswordChange = false"
					>
						キャンセル
					</CommonButton>
					<CommonButton
						type="submit"
						:loading="changingPassword"
						:disabled="!isPasswordFormValid || changingPassword"
					>
						変更
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

const route = useRoute();
const { $rpc } = useNuxtApp();
const authStore = useAuthStore();
const { user: currentUser } = storeToRefs(authStore);

// Type definitions
interface UserProfile {
	id: string;
	email: string;
	username: string;
	emailVerified: boolean;
	createdAt: number;
	updatedAt: number;
}

interface Rule {
	id: string;
	name: string;
	description: string;
	visibility: string;
	createdAt: number;
	updatedAt: number;
}

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
	return (
		editForm.value.username.trim().length > 0 &&
		editForm.value.email.trim().length > 0 &&
		Object.keys(errors.value).length === 0
	);
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
			error.value = "ユーザー名が指定されていません";
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
		}
	} catch (err: unknown) {
		console.error("Failed to load profile:", err);
		error.value = err instanceof Error ? err.message : "プロフィールの読み込みに失敗しました";
	} finally {
		loading.value = false;
	}
};

// Validation methods
const validateUsername = () => {
	errors.value.username = "";
	const username = editForm.value.username.trim();

	if (!username) {
		errors.value.username = "ユーザー名は必須です";
	} else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
		errors.value.username = "英数字、ハイフン、アンダースコアのみ使用可能です";
	} else if (username.length < 3) {
		errors.value.username = "3文字以上で入力してください";
	}
};

const validateEmail = () => {
	errors.value.email = "";
	const email = editForm.value.email.trim();

	if (!email) {
		errors.value.email = "メールアドレスは必須です";
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.value.email = "有効なメールアドレスを入力してください";
	}
};

const validateNewPassword = () => {
	passwordErrors.value.newPassword = "";
	if (passwordForm.value.newPassword.length < 8) {
		passwordErrors.value.newPassword = "パスワードは8文字以上で設定してください";
	}
};

const validatePasswordConfirm = () => {
	passwordErrors.value.confirmPassword = "";
	if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
		passwordErrors.value.confirmPassword = "パスワードが一致しません";
	}
};

const updateProfile = async () => {
	try {
		updating.value = true;
		updateError.value = null;

		// Validate before submitting
		validateUsername();
		validateEmail();

		if (!isFormValid.value) {
			return;
		}

		const result = await $rpc.users.updateProfile({
			username: editForm.value.username.trim(),
			email: editForm.value.email.trim(),
		});

		// Update local state
		user.value = result.user;
		isEditing.value = false;

		// Update auth store if updating own profile
		if (isOwnProfile.value) {
			await authStore.updateUser(result.user);
		}

		// Show success message
		const { success } = useToast();
		success("プロフィールを更新しました");
	} catch (err: unknown) {
		console.error("Failed to update profile:", err);

		if (err instanceof Error) {
			if (err.message.includes("already in use")) {
				updateError.value = "そのユーザー名またはメールアドレスは既に使用されています";
			} else {
				updateError.value = err.message || "プロフィールの更新に失敗しました";
			}
		} else {
			updateError.value = "プロフィールの更新に失敗しました";
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
		success("パスワードを変更しました");
	} catch (err: unknown) {
		console.error("Failed to change password:", err);

		if (err instanceof Error) {
			if (err.message.includes("incorrect") || err.message.includes("wrong")) {
				passwordError.value = "現在のパスワードが正しくありません";
			} else {
				passwordError.value = err.message || "パスワードの変更に失敗しました";
			}
		} else {
			passwordError.value = "パスワードの変更に失敗しました";
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