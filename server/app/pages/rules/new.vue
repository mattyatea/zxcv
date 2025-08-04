<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ $t('rules.createNewRule') }}</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ $t('rules.shareWithCommunity') }}
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ $t('rules.basicInfo') }}</h2>
        
        <div class="space-y-4">
          <div>
            <label for="name" class="label">{{ $t('rules.form.name') }}</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              pattern="[a-zA-Z0-9_-]+"
              class="input"
              placeholder="my-awesome-rule"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ $t('rules.form.nameHint') }}
            </p>
          </div>


          <div>
            <label for="description" class="label">{{ $t('rules.form.description') }}</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="input"
              :placeholder="$t('rules.form.descriptionPlaceholder')"
            />
          </div>

          <div>
            <label for="visibility" class="label">{{ $t('rules.form.visibility') }}</label>
            <select
              id="visibility"
              v-model="form.visibility"
              class="input"
            >
              <option value="public">{{ $t('rules.form.visibilityOptions.public') }}</option>
              <option value="private">{{ $t('rules.form.visibilityOptions.private') }}</option>
            </select>
          </div>

          <div>
            <label for="organization" class="label">{{ $t('rules.form.organization') }} ({{ $t('common.optional') }})</label>
            <select
              id="organization"
              v-model="selectedOrganizationId"
              class="input"
              @change="updateOrganization"
            >
              <option value="">{{ $t('rules.form.noOrganization') }}</option>
              <option v-for="organization in organizations" :key="organization.id" :value="organization.id">
                {{ organization.displayName }}
              </option>
            </select>
            <p v-if="form.org" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ $t('rules.form.urlPreview') }} @{{ form.org }}/{{ form.name || 'rule-name' }}
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ $t('rules.form.organizationHint') }}
            </p>
          </div>

          <div>
            <label for="tags" class="label">{{ $t('rules.form.tags') }}</label>
            <div class="flex gap-2 mb-2">
              <input
                v-model="tagInput"
                type="text"
                class="input flex-1"
                :placeholder="$t('rules.form.tagsPlaceholder')"
                @keydown.enter.prevent="addTag"
              />
              <Button
                type="button"
                @click="addTag"
                variant="secondary"
                size="sm"
              >
                {{ $t('rules.form.addTag') }}
              </Button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in form.tags"
                :key="tag"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Rule Content -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ $t('rules.ruleContent') }}</h2>
        
        <div class="space-y-4">
          <div>
            <label for="content" class="label">{{ $t('rules.form.content') }}</label>
            <div class="mb-2">
              <Button
                type="button"
                @click="showFileUpload = !showFileUpload"
                variant="ghost"
                size="sm"
              >
                {{ showFileUpload ? $t('rules.form.writeDirectly') : $t('rules.form.uploadMarkdown') }}
              </Button>
            </div>
            
            <div v-if="showFileUpload" class="mb-4">
              <input
                type="file"
                accept=".md,.markdown"
                @change="handleFileUpload"
                class="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  dark:file:bg-blue-900 dark:file:text-blue-200
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
              />
            </div>
            
            <textarea
              id="content"
              v-model="form.content"
              rows="15"
              required
              class="input font-mono text-sm"
              :placeholder="$t('rules.form.contentPlaceholder')"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ $t('rules.form.markdownSupported') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4">
        <Button
          :tag="NuxtLink"
          to="/rules"
          variant="secondary"
        >
          {{ $t('common.cancel') }}
        </Button>
        <Button
          type="submit"
          :loading="loading"
          :disabled="loading"
          variant="primary"
        >
          {{ loading ? $t('rules.creating') : $t('rules.createRule') }}
        </Button>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <p class="text-sm text-red-800 dark:text-red-400">{{ error }}</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRpc } from "~/composables/useRpc";

definePageMeta({
	middleware: "auth",
});

const { t } = useI18n();

useHead({
	title: t("rules.newRuleTitle"),
});

const form = ref({
	name: "",
	org: "",
	description: "",
	visibility: "public",
	organizationId: "",
	tags: [],
	content: "",
});

const tagInput = ref("");
const organizations = ref([]);
const loading = ref(false);
const error = ref("");
const selectedOrganizationId = ref("");
const showFileUpload = ref(false);

const handleFileUpload = (event) => {
	const file = event.target.files[0];
	if (file && (file.name.endsWith(".md") || file.name.endsWith(".markdown"))) {
		const reader = new FileReader();
		reader.onload = (e) => {
			form.value.content = e.target.result;
		};
		reader.readAsText(file);
	} else {
		error.value = t("rules.messages.invalidFileType");
	}
};

const addTag = () => {
	const tag = tagInput.value.trim().toLowerCase();
	if (tag && !form.value.tags.includes(tag)) {
		form.value.tags.push(tag);
		tagInput.value = "";
	}
};

const removeTag = (index) => {
	form.value.tags.splice(index, 1);
};

const updateOrganization = () => {
	const selected = organizations.value.find((org) => org.id === selectedOrganizationId.value);
	if (selected) {
		form.value.org = selected.name;
		form.value.organizationId = selected.id;
	} else {
		form.value.org = "";
		form.value.organizationId = "";
	}
};

const $rpc = useRpc();

const handleSubmit = async () => {
	loading.value = true;
	error.value = "";

	try {
		const response = await $rpc.rules.create(form.value);
		// If posted to an organization, redirect to the organization-scoped URL
		if (form.value.org) {
			await navigateTo(`/rules/@${form.value.org}/${form.value.name}`);
		} else {
			// Get the current user's username from auth store
			const authStore = useAuthStore();
			if (authStore.user?.username) {
				await navigateTo(`/rules/@${authStore.user.username}/${form.value.name}`);
			} else {
				// Fallback: If username is not available, show error
				error.value = t("rules.messages.createError");
			}
		}
	} catch (err) {
		error.value = err.message || t("rules.messages.createError");
	} finally {
		loading.value = false;
	}
};

const fetchOrganizations = async () => {
	try {
		const response = await $rpc.organizations.list();
		organizations.value = response;
	} catch (error) {
		console.error("Failed to fetch organizations:", error);
	}
};

onMounted(() => {
	fetchOrganizations();
});
</script>