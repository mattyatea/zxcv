<template>
  <CommonModal v-model="isOpen" :title="$t('organizations.inviteMember.title')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- ユーザー名検索 -->
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ $t('organizations.inviteMember.usernameLabel') }}
        </label>
        <div class="relative">
          <input
            id="username"
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            :placeholder="$t('organizations.inviteMember.usernamePlaceholder')"
            class="form-input"
            autocomplete="off"
          />
          
          <!-- 検索結果のドロップダウン -->
          <div
            v-if="showSuggestions && searchResults.length > 0"
            class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto"
          >
            <button
              v-for="user in searchResults"
              :key="user.id"
              type="button"
              @click="selectUser(user)"
              class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
            >
              <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {{ user.username[0].toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user.username }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ user.email }}</p>
              </div>
            </button>
          </div>
          
          <!-- ローディング -->
          <div v-if="searching" class="absolute right-3 top-1/2 -translate-y-1/2">
            <CommonLoadingSpinner size="sm" />
          </div>
        </div>
      </div>

      <!-- 選択されたユーザー -->
      <div v-if="selectedUser" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
            {{ selectedUser.username[0].toUpperCase() }}
          </div>
          <div>
            <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedUser.username }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedUser.email }}</p>
          </div>
        </div>
        <button
          type="button"
          @click="selectedUser = null"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="error" class="text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <!-- アクションボタン -->
      <div class="flex justify-end gap-3 pt-4">
        <CommonButton
          type="button"
          variant="ghost"
          @click="handleCancel"
          :disabled="inviting"
        >
          {{ $t('common.cancel') }}
        </CommonButton>
        <CommonButton
          type="submit"
          :disabled="!selectedUser || inviting"
          :loading="inviting"
        >
          {{ $t('organizations.inviteMember.invite') }}
        </CommonButton>
      </div>
    </form>
  </CommonModal>
</template>

<script setup lang="ts">
import { debounce } from "lodash-es";
import { ref, watch } from "vue";

interface User {
	id: string;
	username: string;
	email: string;
}

interface Props {
	modelValue: boolean;
	organizationId: string;
}

interface Emits {
	(e: "update:modelValue", value: boolean): void;
	(e: "invited", user: User): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { $rpc } = useNuxtApp();
const { t } = useI18n();

const isOpen = computed({
	get: () => props.modelValue,
	set: (value) => emit("update:modelValue", value),
});

const searchQuery = ref("");
const searchResults = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const searching = ref(false);
const inviting = ref(false);
const error = ref("");
const showSuggestions = ref(false);

// ユーザー検索（デバウンス付き）
const searchUsers = async (query: string) => {
	if (!query || query.length < 1) {
		searchResults.value = [];
		return;
	}

	searching.value = true;
	error.value = "";

	try {
		const results = await $rpc.users.searchByUsername({
			username: query,
			limit: 10,
		});
		searchResults.value = results;
		showSuggestions.value = true;
	} catch (err) {
		console.error("Failed to search users:", err);
		searchResults.value = [];
	} finally {
		searching.value = false;
	}
};

const handleSearch = debounce((event: Event) => {
	const query = (event.target as HTMLInputElement).value;
	searchUsers(query);
}, 300);

const selectUser = (user: User) => {
	selectedUser.value = user;
	searchQuery.value = user.username;
	showSuggestions.value = false;
};

const handleSubmit = async () => {
	if (!selectedUser.value) {
		return;
	}

	inviting.value = true;
	error.value = "";

	try {
		await $rpc.organizations.inviteMember({
			organizationId: props.organizationId,
			username: selectedUser.value.username,
		});

		emit("invited", selectedUser.value);
		isOpen.value = false;

		// 成功メッセージを表示
		const { showToast } = useToast();
		showToast({
			message: t("organizations.inviteMember.success", { username: selectedUser.value.username }),
			type: "success",
		});
	} catch (err) {
		console.error("Failed to invite member:", err);
		if (err instanceof Error && err.message?.includes("already a member")) {
			error.value = t("organizations.inviteMember.alreadyMember");
		} else if (err instanceof Error && err.message?.includes("invitation has already been sent")) {
			error.value = t("organizations.inviteMember.alreadyInvited");
		} else {
			error.value = t("organizations.inviteMember.error");
		}
	} finally {
		inviting.value = false;
	}
};

const handleCancel = () => {
	isOpen.value = false;
};

// モーダルが閉じられたときにリセット
watch(isOpen, (newValue) => {
	if (!newValue) {
		searchQuery.value = "";
		searchResults.value = [];
		selectedUser.value = null;
		error.value = "";
		showSuggestions.value = false;
	}
});

// クリック外でドロップダウンを閉じる
onMounted(() => {
	const handleClickOutside = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (!target.closest(".relative")) {
			showSuggestions.value = false;
		}
	};

	document.addEventListener("click", handleClickOutside);

	onUnmounted(() => {
		document.removeEventListener("click", handleClickOutside);
	});
});
</script>