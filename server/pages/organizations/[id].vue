<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="container-lg py-8">
      <!-- ローディング -->
      <div v-if="loading" class="space-y-6">
        <div class="skeleton h-10 w-1/3"></div>
        <div class="skeleton h-6 w-2/3"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="card">
              <div class="skeleton h-6 w-1/4 mb-4"></div>
              <div class="space-y-2">
                <div class="skeleton h-4 w-full"></div>
                <div class="skeleton h-4 w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- チーム詳細 -->
      <div v-else-if="organization">
        <!-- ヘッダー -->
        <div class="flex items-start justify-between mb-8">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                {{ organization.name[0].toUpperCase() }}
              </div>
              <div>
                <h1 class="heading-1">{{ organization.name }}</h1>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ organization.description || $t('organizations.noDescription') }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <CommonButton
              v-if="organization.role === 'owner'"
              variant="ghost"
              size="sm"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ $t('organizations.detail.settings') }}
            </CommonButton>
            <CommonButton
              v-if="organization.role === 'member'"
              variant="danger"
              size="sm"
            >
              {{ $t('organizations.detail.leaveOrganization') }}
            </CommonButton>
          </div>
        </div>

        <!-- 統計 -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('organizations.detail.members') }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ organization.memberCount }}</p>
              </div>
              <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('organizations.detail.rules') }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ organization.ruleCount }}</p>
              </div>
              <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('organizations.detail.createdAt') }}</p>
                <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ new Date(organization.createdAt).toLocaleDateString('ja-JP') }}
                </p>
              </div>
              <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- タブ -->
        <div class="border-b border-gray-200 dark:border-gray-800 mb-6">
          <nav class="flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- タブコンテンツ -->
        <div v-if="activeTab === 'rules'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-if="rules.length === 0" class="col-span-full text-center py-12">
            <p class="text-gray-600 dark:text-gray-400">{{ $t('organizations.detail.noRules') }}</p>
          </div>
          <NuxtLink
            v-for="rule in rules"
            :key="rule.id"
            :to="`/rules/@${organization.name}/${rule.name}`"
            class="card-hover"
          >
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ rule.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ rule.description }}</p>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">
                {{ new Date(rule.updatedAt).toLocaleDateString('ja-JP') }}
              </span>
              <span class="badge badge-primary">
                v{{ rule.version }}
              </span>
            </div>
          </NuxtLink>
        </div>

        <div v-else-if="activeTab === 'members'" class="space-y-4">
          <div v-for="member in members" :key="member.id" class="card flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                {{ member.username[0].toUpperCase() }}
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ member.username }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ member.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge" :class="member.role === 'owner' ? 'badge-primary' : 'badge-gray'">
                {{ member.role === 'owner' ? $t('organizations.owner') : $t('organizations.member') }}
              </span>
              <button
                v-if="organization.role === 'owner' && member.id !== authStore.user?.id && member.role !== 'owner'"
                @click="removeMember(member)"
                class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                :title="$t('organizations.detail.removeMember')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="organization.role === 'owner'" class="mt-6">
            <CommonButton @click="showInviteModal = true" variant="ghost" class="w-full">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {{ $t('organizations.detail.inviteMembers') }}
            </CommonButton>
          </div>
        </div>
      </div>

      <!-- エラー -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">{{ $t('organizations.detail.notFound') }}</p>
        <NuxtLink to="/organizations">
          <CommonButton variant="ghost" class="mt-4">
            {{ $t('organizations.detail.backToList') }}
          </CommonButton>
        </NuxtLink>
      </div>
    </div>
    
    <!-- 招待モーダル -->
    <OrganizationsInviteMemberModal
      v-model="showInviteModal"
      :organization-id="organization?.id || ''"
      @invited="handleMemberInvited"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

definePageMeta({
	middleware: "auth",
});

interface Organization {
	id: string;
	name: string;
	description?: string;
	role: "owner" | "member";
	memberCount: number;
	ruleCount: number;
	createdAt: string;
}

interface Rule {
	id: string;
	name: string;
	description: string;
	version: string;
	updatedAt: string;
}

interface Member {
	id: string;
	username: string;
	email: string;
	role: "owner" | "member";
}

interface User {
	id: string;
	username: string;
	email: string;
}

const { t } = useI18n();
const route = useRoute();
const { $rpc } = useNuxtApp();
const authStore = useAuthStore();
const loading = ref(false);
const organization = ref<Organization | null>(null);
const rules = ref<Rule[]>([]);
const members = ref<Member[]>([]);
const activeTab = ref("rules");
const showInviteModal = ref(false);

const tabs = [
	{ id: "rules", label: t("organizations.detail.rules") },
	{ id: "members", label: t("organizations.detail.members") },
];

const fetchOrganizationDetails = async () => {
	loading.value = true;
	try {
		const organizationId = route.params.id as string;

		// Fetch organization details
		const organizationData = await $rpc.organizations.get({ id: organizationId });
		organization.value = organizationData;

		// Fetch rules if on rules tab
		if (activeTab.value === "rules") {
			const rulesData = await $rpc.organizations.rules({ organizationId });
			rules.value = rulesData;
		}

		// Fetch members if on members tab
		if (activeTab.value === "members") {
			const membersData = await $rpc.organizations.members({ organizationId });
			members.value = membersData;
		}
	} catch (error) {
		console.error("Failed to fetch organization details:", error);
		organization.value = null;
	} finally {
		loading.value = false;
	}
};

const fetchTabData = async (tab: string) => {
	const organizationId = route.params.id as string;

	try {
		if (tab === "rules" && rules.value.length === 0) {
			const rulesData = await $rpc.organizations.rules({ organizationId });
			rules.value = rulesData;
		} else if (tab === "members" && members.value.length === 0) {
			const membersData = await $rpc.organizations.members({ organizationId });
			members.value = membersData;
		}
	} catch (error) {
		console.error(`Failed to fetch ${tab}:`, error);
	}
};

const removeMember = async (member: Member) => {
	if (
		!organization.value ||
		!confirm(t("organizations.detail.confirmRemoveMember", { username: member.username }))
	) {
		return;
	}

	try {
		await $rpc.organizations.removeMember({
			organizationId: organization.value.id,
			userId: member.id,
		});

		// メンバーリストから削除
		members.value = members.value.filter((m) => m.id !== member.id);

		// メンバー数を更新
		if (organization.value) {
			organization.value.memberCount--;
		}

		const { showToast } = useToast();
		showToast({
			message: t("organizations.detail.memberRemoved", { username: member.username }),
			type: "success",
		});
	} catch (error) {
		console.error("Failed to remove member:", error);
		const { showToast } = useToast();
		showToast({
			message: t("organizations.detail.removeMemberError"),
			type: "error",
		});
	}
};

const handleMemberInvited = (_user: User) => {
	// 招待が成功したらメンバーリストを再取得
	if (activeTab.value === "members") {
		fetchTabData("members");
	}
};

watch(activeTab, (newTab) => {
	fetchTabData(newTab);
});

onMounted(() => {
	fetchOrganizationDetails();
});
</script>