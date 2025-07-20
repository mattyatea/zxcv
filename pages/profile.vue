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
					<h3 class="text-lg font-semibold text-gray-900 mb-2">所属チーム</h3>
					<p class="text-3xl font-bold text-green-600">{{ stats.teamsCount || 0 }}</p>
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
		<Teleport to="body">
			<div
				v-if="isEditing"
				class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
				@click.self="cancelEdit"
			>
				<div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
					<h2 class="text-xl font-bold mb-4">プロフィールを編集</h2>
					<form @submit.prevent="updateProfile">
						<div class="mb-4">
							<label for="username" class="block text-sm font-medium text-gray-700 mb-2">
								ユーザー名
							</label>
							<input
								id="username"
								v-model="editForm.username"
								type="text"
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						</div>
						<div class="mb-4">
							<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
								メールアドレス
							</label>
							<input
								id="email"
								v-model="editForm.email"
								type="email"
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						</div>
						<div class="flex justify-end space-x-2">
							<button
								type="button"
								@click="cancelEdit"
								class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								キャンセル
							</button>
							<button
								type="submit"
								:disabled="updating"
								class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
							>
								{{ updating ? "更新中..." : "更新" }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
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
	teamsCount: 0,
});
const recentRules = ref<Rule[]>([]);
const isEditing = ref(false);
const updating = ref(false);
const editForm = ref({
	username: "",
	email: "",
});

// Computed
const isOwnProfile = computed(() => {
	return currentUser.value?.id === user.value?.id;
});

// Methods
const _formatDate = (timestamp: number) => {
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
		const profileData = await ($rpc as any).users.getProfile({
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

const _updateProfile = async () => {
	try {
		updating.value = true;

		const result = await ($rpc as any).users.updateProfile({
			username: editForm.value.username,
			email: editForm.value.email,
		});

		// Update local state
		user.value = result.user;
		isEditing.value = false;

		// Show success message
		// TODO: Toast notification
	} catch (err: unknown) {
		console.error("Failed to update profile:", err);
		// TODO: Show error toast
	} finally {
		updating.value = false;
	}
};

const _cancelEdit = () => {
	isEditing.value = false;
	// Reset form to original values
	if (user.value) {
		editForm.value = {
			username: user.value.username,
			email: user.value.email,
		};
	}
};

// Lifecycle
onMounted(() => {
	loadProfile();
});
</script>