<template>
	<div class="min-h-screen bg-gray-50">
		<div class="container mx-auto px-4 py-8">
			<!-- Loading state -->
			<div v-if="loading" class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>

			<!-- Error state -->
			<div v-else-if="error" class="text-center py-12">
				<h2 class="text-2xl font-semibold text-gray-800 mb-2">ユーザーが見つかりません</h2>
				<p class="text-gray-600">指定されたユーザーは存在しないか、削除された可能性があります。</p>
			</div>

			<!-- User profile -->
			<div v-else-if="profileData" class="max-w-6xl mx-auto">
				<!-- Profile header -->
				<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div class="flex items-start justify-between">
						<div>
							<h1 class="text-3xl font-bold text-gray-900 mb-2">
								@{{ profileData.user.username }}
							</h1>
							<div class="flex items-center gap-6 text-gray-600">
								<div class="flex items-center gap-2">
									<Icon name="ph:calendar" class="w-4 h-4" />
									<span>登録日: {{ formatDate(profileData.user.createdAt) }}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Stats -->
					<div class="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
						<div>
							<div class="text-2xl font-bold text-gray-900">
								{{ profileData.stats.publicRulesCount }}
							</div>
							<div class="text-sm text-gray-600">公開ルール</div>
						</div>
						<div>
							<div class="text-2xl font-bold text-gray-900">
								{{ profileData.stats.totalStars }}
							</div>
							<div class="text-sm text-gray-600">獲得スター</div>
						</div>
					</div>
				</div>

				<!-- Public rules -->
				<div class="bg-white rounded-lg shadow-sm p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">公開ルール</h2>
					<div v-if="profileData.publicRules.length === 0" class="text-center py-8 text-gray-500">
						まだ公開ルールがありません
					</div>
					<div v-else class="space-y-4">
						<NuxtLink
							v-for="rule in profileData.publicRules"
							:key="rule.id"
							:to="`/rules/@${profileData.user.username}/${rule.name}`"
							class="block p-4 border rounded-lg hover:border-blue-500 transition-colors"
						>
							<div class="flex items-start justify-between">
								<div>
									<h3 class="text-lg font-medium text-gray-900">{{ rule.name }}</h3>
									<p v-if="rule.description" class="text-gray-600 mt-1">
										{{ rule.description }}
									</p>
									<div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
										<span v-if="rule.organization" class="flex items-center gap-1">
											<Icon name="ph:building" class="w-4 h-4" />
											@{{ rule.organization.name }}
										</span>
										<span class="flex items-center gap-1">
											<Icon name="ph:star" class="w-4 h-4" />
											{{ rule.stars }}
										</span>
										<span>{{ formatDate(rule.updatedAt) }}</span>
									</div>
								</div>
							</div>
						</NuxtLink>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const route = useRoute();
const { $rpc } = useNuxtApp();

// Get username from route
const username = computed(() => route.params.username as string);

// State
const loading = ref(true);
const error = ref(false);
const profileData = ref<{
	user: {
		id: string;
		username: string;
		createdAt: number;
	};
	stats: {
		publicRulesCount: number;
		totalStars: number;
	};
	publicRules: Array<{
		id: string;
		name: string;
		description: string;
		stars: number;
		createdAt: number;
		updatedAt: number;
		organization: { name: string } | null;
	}>;
} | null>(null);

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

// Fetch profile on mount
onMounted(() => {
	fetchProfile();
});

// Watch for route changes
watch(username, () => {
	fetchProfile();
});
</script>