<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
    <div class="container-lg space-y-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-2">
          <h1 class="heading-1 text-gray-900 dark:text-gray-100">{{ t('admin.title') }}</h1>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl">
            {{ t('admin.description') }}
          </p>
        </div>
        <CommonButton
          variant="primary"
          size="lg"
          glow
          class="self-start"
          @click="assignModalOpen = true"
        >
          <template #icon-left>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </template>
          {{ t('admin.moderators.assign') }}
        </CommonButton>
      </div>

      <div class="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="w-full lg:max-w-md">
            <CommonInput
              v-model="searchQuery"
              :label="t('admin.moderators.searchLabel')"
              :placeholder="t('admin.moderators.searchPlaceholder')"
              clearable
            >
              <template #prefix>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.65 5.65a7.5 7.5 0 0010.6 10.6z" />
                </svg>
              </template>
            </CommonInput>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('admin.moderators.total', { count: filteredModerators.length, total: moderators.length }) }}
          </div>
        </div>

        <div v-if="isLoading" class="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
          <div v-for="index in 6" :key="index" class="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>

        <div
          v-else-if="fetchErrorMessage"
          class="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-6 text-red-600 dark:text-red-300"
        >
          {{ fetchErrorMessage }}
        </div>

        <div
          v-else-if="!hasModerators"
          class="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 py-16 text-center"
        >
          <svg class="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7a4 4 0 118 0m-4 4v6m-3 0h6" />
          </svg>
          <div class="space-y-1">
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ t('admin.moderators.noModerators') }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('admin.moderators.emptyHint') }}
            </p>
          </div>
          <CommonButton variant="ghost" size="sm" @click="assignModalOpen = true">
            {{ t('admin.moderators.assign') }}
          </CommonButton>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
          <div
            v-for="moderator in filteredModerators"
            :key="moderator.id"
            class="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-lg font-semibold text-white shadow-md">
                  {{ moderator.username?.[0]?.toUpperCase() || '?' }}
                </div>
                <div>
                  <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {{ moderator.username }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ moderator.email || t('admin.fields.noEmail') }}
                  </p>
                </div>
              </div>
              <span
                class="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-500/20 px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-300 uppercase tracking-wide"
              >
                {{ t(`admin.roles.${moderator.role}`) }}
              </span>
            </div>

            <div class="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V5a4 4 0 118 0v2m-9 4h10l1 9H8l1-9z" />
                </svg>
                {{ t('admin.fields.roleLabel', { role: t(`admin.roles.${moderator.role}`) }) }}
              </span>
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l2.5 2.5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                </svg>
                {{ t('admin.fields.createdAt', { date: formatDate(new Date(moderator.createdAt * 1000), 'long') }) }}
              </span>
            </div>

            <div class="mt-6 flex items-center justify-end">
              <CommonButton
                v-if="moderator.role === 'moderator'"
                variant="danger"
                size="sm"
                @click="openRemoveModal(moderator)"
              >
                <template #icon-left>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </template>
                {{ t('admin.actions.remove') }}
              </CommonButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Moderator Modal -->
    <CommonModal v-model="assignModalOpen" :title="t('admin.modal.assign.title')">
      <div class="space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('admin.modal.assign.description') }}
        </p>

        <div class="relative">
          <CommonInput
            v-model="assignSearchQuery"
            :label="t('admin.modal.assign.searchLabel')"
            :placeholder="t('admin.modal.assign.searchPlaceholder')"
            autocomplete="off"
            clearable
          >
            <template #prefix>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.65 5.65a7.5 7.5 0 0010.6 10.6z" />
              </svg>
            </template>
          </CommonInput>

          <div
            v-if="showAssignSuggestions && assignResults.length > 0"
            class="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl"
          >
            <button
              v-for="user in assignResults"
              :key="user.id"
              type="button"
              class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="selectAssignUser(user)"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white font-medium">
                {{ user.username?.[0]?.toUpperCase() || '?' }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ user.username }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ user.email || t('admin.fields.noEmail') }}
                </p>
              </div>
            </button>
          </div>

          <div v-if="assignSearching" class="absolute right-3 top-[52px]">
            <CommonLoadingSpinner size="sm" />
          </div>
        </div>

        <div
          v-if="assignSelectedUser"
          class="flex items-center justify-between gap-4 rounded-2xl border border-primary-200 dark:border-primary-500/40 bg-primary-50 dark:bg-primary-950/40 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white font-semibold">
              {{ assignSelectedUser.username?.[0]?.toUpperCase() || '?' }}
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ assignSelectedUser.username }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ assignSelectedUser.email || t('admin.fields.noEmail') }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="assignSelectedUser = null"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p v-if="assignErrorMessage" class="text-sm text-red-600 dark:text-red-400">
          {{ assignErrorMessage }}
        </p>

        <div class="flex justify-end gap-3">
          <CommonButton variant="ghost" @click="assignModalOpen = false">
            {{ t('common.cancel') }}
          </CommonButton>
          <CommonButton
            :loading="assignSubmitting"
            :disabled="!assignSelectedUser || assignSubmitting"
            @click="submitAssign"
          >
            {{ t('admin.modal.assign.submit') }}
          </CommonButton>
        </div>
      </div>
    </CommonModal>

    <!-- Remove Moderator Modal -->
    <CommonModal v-model="removeModalOpen" :title="t('admin.modal.remove.title')" :prevent-close="removing">
      <div class="space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('admin.modal.remove.description', { username: removeTarget?.username ?? '' }) }}
        </p>
        <div class="flex justify-end gap-3">
          <CommonButton
            variant="ghost"
            :disabled="removing"
            @click="removeModalOpen = false"
          >
            {{ t('admin.modal.remove.cancel') }}
          </CommonButton>
          <CommonButton
            variant="danger"
            :loading="removing"
            @click="confirmRemove"
          >
            {{ t('admin.modal.remove.confirm') }}
          </CommonButton>
        </div>
      </div>
    </CommonModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { debounce } from "lodash-es";
import type { InferRouterOutputs } from "@orpc/server";
import type { router } from "~/server/orpc/router";
import { useToast } from "~/composables/useToast";
import { useRpc } from "~/composables/useRpc";

definePageMeta({
  middleware: "auth",
  title: "Admin Dashboard",
});

const { t, formatDate } = useI18n();
const $rpc = useRpc();
const { success: toastSuccess, error: toastError } = useToast();

type RouterOutputs = InferRouterOutputs<typeof router>;
type ModeratorsResponse = RouterOutputs["admin"]["getModerators"];
type Moderator = ModeratorsResponse[number];
type SearchResults = RouterOutputs["users"]["searchByUsername"];
type SearchUser = SearchResults[number];

const moderators = ref<Moderator[]>([]);
const isLoading = ref(false);
const fetchErrorMessage = ref("");

const searchQuery = ref("");

const assignModalOpen = ref(false);
const assignSearchQuery = ref("");
const assignResults = ref<SearchUser[]>([]);
const assignSelectedUser = ref<SearchUser | null>(null);
const assignSearching = ref(false);
const assignSubmitting = ref(false);
const assignErrorMessage = ref("");
const showAssignSuggestions = ref(false);

const removeTarget = ref<Moderator | null>(null);
const removing = ref(false);

const filteredModerators = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return moderators.value;
  }
  return moderators.value.filter((member) => {
    const roleLabel = t(`admin.roles.${member.role}` as const);
    return [member.username, member.email ?? "", member.role, roleLabel]
      .some((field) => field?.toLowerCase?.().includes(query));
  });
});

const hasModerators = computed(() => filteredModerators.value.length > 0);

const removeModalOpen = computed({
  get: () => removeTarget.value !== null,
  set: (value) => {
    if (!value) {
      removeTarget.value = null;
    }
  },
});

const parseStatus = (error: unknown): number | null => {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: number }).status;
    if (typeof status === "number") {
      return status;
    }
  }
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { status?: number } }).response;
    if (response && typeof response.status === "number") {
      return response.status;
    }
  }
  return null;
};

const resetAssignModal = () => {
  assignSearchQuery.value = "";
  assignResults.value = [];
  assignSelectedUser.value = null;
  assignErrorMessage.value = "";
  assignSearching.value = false;
  showAssignSuggestions.value = false;
};

const handleUnauthorized = async () => {
  toastError(t("admin.messages.accessDenied"));
  await navigateTo("/");
};

const fetchModerators = async () => {
  isLoading.value = true;
  fetchErrorMessage.value = "";
  try {
    const data = await $rpc.admin.getModerators();
    moderators.value = data;
  } catch (error) {
    const status = parseStatus(error);
    if (status === 401 || status === 403) {
      await handleUnauthorized();
      return;
    }
    console.error("Failed to fetch moderators:", error);
    fetchErrorMessage.value = t("admin.messages.fetchError");
    toastError(t("admin.messages.fetchError"));
  } finally {
    isLoading.value = false;
  }
};

const assignDebouncedSearch = debounce(async (query: string) => {
  assignErrorMessage.value = "";
  if (!assignModalOpen.value) {
    return;
  }
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    assignResults.value = [];
    assignSearching.value = false;
    showAssignSuggestions.value = false;
    return;
  }

  assignSearching.value = true;

  try {
    const results = await $rpc.users.searchByUsername({
      username: trimmed,
      limit: 10,
    });
    assignResults.value = results;
    showAssignSuggestions.value = results.length > 0;
  } catch (error) {
    const status = parseStatus(error);
    if (status === 401 || status === 403) {
      await handleUnauthorized();
      return;
    }
    console.error("Failed to search users:", error);
    assignErrorMessage.value = t("admin.messages.searchError");
    showAssignSuggestions.value = false;
  } finally {
    assignSearching.value = false;
  }
}, 300);

watch(assignSearchQuery, (value) => {
  assignDebouncedSearch(value);
});

watch(assignModalOpen, (open) => {
  if (!open) {
    resetAssignModal();
  } else {
    assignResults.value = [];
    assignSelectedUser.value = null;
    assignErrorMessage.value = "";
    showAssignSuggestions.value = false;
  }
});

const selectAssignUser = (user: SearchUser) => {
  assignSelectedUser.value = user;
  assignSearchQuery.value = user.username;
  showAssignSuggestions.value = false;
};

const submitAssign = async () => {
  if (!assignSelectedUser.value) {
    assignErrorMessage.value = t("admin.messages.selectUser");
    return;
  }

  assignSubmitting.value = true;
  assignErrorMessage.value = "";

  try {
    await $rpc.admin.assignModerator({ userId: assignSelectedUser.value.id });
    toastSuccess(t("admin.messages.assignSuccess"));
    assignModalOpen.value = false;
    resetAssignModal();
    await fetchModerators();
  } catch (error) {
    const status = parseStatus(error);
    if (status === 401 || status === 403) {
      await handleUnauthorized();
      return;
    }
    console.error("Failed to assign moderator:", error);
    const fallback = t("admin.messages.assignError");
    const message = status === 404
      ? t("admin.messages.userNotFound")
      : status === 400
        ? t("admin.messages.assignValidation")
        : fallback;
    assignErrorMessage.value = message;
    toastError(message);
  } finally {
    assignSubmitting.value = false;
  }
};

const openRemoveModal = (moderator: Moderator) => {
  removeTarget.value = moderator;
};

const confirmRemove = async () => {
  if (!removeTarget.value) {
    return;
  }

  removing.value = true;
  try {
    await $rpc.admin.removeModerator({ userId: removeTarget.value.id });
    toastSuccess(t("admin.messages.removeSuccess"));
    removeTarget.value = null;
    await fetchModerators();
  } catch (error) {
    const status = parseStatus(error);
    if (status === 401 || status === 403) {
      await handleUnauthorized();
      return;
    }
    console.error("Failed to remove moderator:", error);
    const message = status === 400
      ? t("admin.messages.notModerator")
      : t("admin.messages.removeError");
    toastError(message);
  } finally {
    removing.value = false;
  }
};

onMounted(() => {
  fetchModerators();
});
</script>
