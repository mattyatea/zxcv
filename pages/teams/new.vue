<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="container-sm py-8">
      <div class="mb-8">
        <h1 class="heading-1 mb-2">新しいチームを作成</h1>
        <p class="text-gray-600 dark:text-gray-400">
          チームを作成してメンバーを招待しましょう
        </p>
      </div>

      <form @submit.prevent="_handleSubmit" class="card max-w-2xl">
        <div class="space-y-6">
          <CommonInput
            v-model="form.name"
            label="チーム名"
            placeholder="例: Frontend Team"
            required
            :error="errors.name"
          />

          <div class="form-group">
            <label class="label">説明</label>
            <textarea
              v-model="form.description"
              class="input min-h-[100px]"
              placeholder="チームの目的や活動内容を記載してください"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="label">プライバシー設定</label>
            <div class="space-y-3">
              <label class="flex items-start cursor-pointer">
                <input
                  v-model="form.visibility"
                  type="radio"
                  value="private"
                  class="mt-1 text-primary-500 focus:ring-primary-500"
                />
                <div class="ml-3">
                  <div class="font-medium text-gray-900 dark:text-gray-100">プライベート</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    招待されたメンバーのみがチームとルールにアクセスできます
                  </div>
                </div>
              </label>
              <label class="flex items-start cursor-pointer">
                <input
                  v-model="form.visibility"
                  type="radio"
                  value="public"
                  class="mt-1 text-primary-500 focus:ring-primary-500"
                />
                <div class="ml-3">
                  <div class="font-medium text-gray-900 dark:text-gray-100">パブリック</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    誰でもチームを表示できますが、参加には承認が必要です
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="label">初期メンバーを招待（オプション）</label>
            <div class="space-y-2">
              <div v-for="(email, index) in inviteEmails" :key="index" class="flex gap-2">
                <CommonInput
                  v-model="inviteEmails[index]"
                  type="email"
                  placeholder="email@example.com"
                  :error="errors[`email_${index}`]"
                />
                <CommonButton
                  v-if="inviteEmails.length > 1"
                  @click="_removeEmail(index)"
                  variant="ghost"
                  size="sm"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </CommonButton>
              </div>
              <CommonButton
                @click="_addEmail"
                variant="ghost"
                size="sm"
                type="button"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                メンバーを追加
              </CommonButton>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <NuxtLink to="/teams">
            <CommonButton variant="ghost">
              キャンセル
            </CommonButton>
          </NuxtLink>
          <CommonButton
            type="submit"
            variant="primary"
            :loading="submitting"
          >
            チームを作成
          </CommonButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "~/composables/useToast";

interface TeamForm {
	name: string;
	description: string;
	visibility: "private" | "public";
}

const form = ref<TeamForm>({
	name: "",
	description: "",
	visibility: "private",
});

const inviteEmails = ref<string[]>([""]);
const errors = ref<Record<string, string>>({});
const submitting = ref(false);

const { success: toastSuccess, error: toastError } = useToast();

const _addEmail = () => {
	inviteEmails.value.push("");
};

const _removeEmail = (index: number) => {
	inviteEmails.value.splice(index, 1);
};

const validateForm = (): boolean => {
	errors.value = {};

	if (!form.value.name.trim()) {
		errors.value.name = "チーム名は必須です";
		return false;
	}

	// Validate emails
	inviteEmails.value.forEach((email, index) => {
		if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			errors.value[`email_${index}`] = "有効なメールアドレスを入力してください";
		}
	});

	return Object.keys(errors.value).length === 0;
};

const _handleSubmit = async () => {
	if (!validateForm()) {
		return;
	}

	submitting.value = true;
	try {
		const { $rpc } = useNuxtApp();
		const data = await $rpc.teams.create({
			name: form.value.name,
			description: form.value.description,
			visibility: form.value.visibility,
			inviteEmails: inviteEmails.value.filter((email) => email.trim()),
		});

		toastSuccess("チームを作成しました");
		await navigateTo(`/teams/${data.id}`);
	} catch (error) {
		console.error("Failed to create team:", error);
		toastError("チームの作成に失敗しました");
	} finally {
		submitting.value = false;
	}
};
</script>