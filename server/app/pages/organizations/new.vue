<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="container-sm py-8">
      <div class="mb-8">
        <h1 class="heading-1 mb-2">{{ $t('organizations.createNewTeam') }}</h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('organizations.inviteAndCollaborate') }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="card max-w-2xl">
        <div class="space-y-6">
          <CommonInput
            v-model="form.name"
            :label="$t('organizations.form.name')"
            :placeholder="$t('organizations.form.namePlaceholder')"
            required
            :error="errors.name"
          />

          <div class="form-group">
            <label class="label">{{ $t('organizations.form.description') }}</label>
            <textarea
              v-model="form.description"
              class="input min-h-[100px]"
              :placeholder="$t('organizations.form.descriptionPlaceholder')"
              rows="4"
            ></textarea>
          </div>


          <div class="form-group">
            <label class="label">{{ $t('organizations.form.inviteMembers') }}</label>
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
                  @click="removeEmail(index)"
                  variant="ghost"
                  size="sm"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </CommonButton>
              </div>
              <CommonButton
                @click="addEmail"
                variant="ghost"
                size="sm"
                type="button"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ $t('organizations.form.addMember') }}
              </CommonButton>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <NuxtLink to="/organizations">
            <CommonButton variant="ghost">
              {{ $t('common.cancel') }}
            </CommonButton>
          </NuxtLink>
          <CommonButton
            type="submit"
            variant="primary"
            :loading="submitting"
          >
            {{ $t('organizations.createTeam') }}
          </CommonButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useRpc } from "~/composables/useRpc";
import type { CreateOrganizationResponse } from "~/types/orpc";

definePageMeta({
	middleware: "auth",
});

// Simple form interface
interface OrganizationForm {
	name: string;
	description: string;
}

const form = ref<OrganizationForm>({
	name: "",
	description: "",
});

const { t } = useI18n();
const inviteEmails = ref<string[]>([""]);
const errors = ref<Record<string, string>>({});
const submitting = ref(false);

const { success: toastSuccess, error: toastError } = useToast();

const addEmail = () => {
	inviteEmails.value.push("");
};

const removeEmail = (index: number) => {
	inviteEmails.value.splice(index, 1);
};

const validateForm = (): boolean => {
	errors.value = {};

	if (!form.value.name.trim()) {
		errors.value.name = t("organizations.validation.nameRequired");
		return false;
	}

	// Validate organization name format
	if (!/^[a-zA-Z0-9-]+$/.test(form.value.name)) {
		errors.value.name = t("organizations.validation.nameFormat");
		return false;
	}

	// Validate emails
	inviteEmails.value.forEach((email, index) => {
		if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			errors.value[`email_${index}`] = t("organizations.validation.invalidEmail");
		}
	});

	return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
	if (!validateForm()) {
		return;
	}

	submitting.value = true;
	try {
		const $rpc = useRpc();
		const data = await $rpc.organizations.create({
			name: form.value.name,
			description: form.value.description,
			inviteEmails: inviteEmails.value.filter((email) => email.trim()),
		});

		toastSuccess(t("organizations.messages.created"));
		await navigateTo(`/organizations/${data.id}`);
	} catch (error) {
		console.error("Failed to create organization:", error);
		toastError(t("organizations.messages.createError"));
	} finally {
		submitting.value = false;
	}
};
</script>