<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create New Rule</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Share your coding standards with the community
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h2>
        
        <div class="space-y-4">
          <div>
            <label for="name" class="label">Rule Name</label>
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
              Only letters, numbers, underscores, and hyphens allowed
            </p>
          </div>

          <div>
            <label for="org" class="label">Organization (optional)</label>
            <input
              id="org"
              v-model="form.org"
              type="text"
              pattern="[a-zA-Z0-9_-]*"
              class="input"
              placeholder="my-org"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your rule will be available at @{{ form.org || 'org' }}/{{ form.name || 'rule-name' }}
            </p>
          </div>

          <div>
            <label for="description" class="label">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="input"
              placeholder="Describe what this rule does and when to use it"
            />
          </div>

          <div>
            <label for="visibility" class="label">Visibility</label>
            <select
              id="visibility"
              v-model="form.visibility"
              class="input"
            >
              <option value="public">Public - Anyone can view</option>
              <option value="private">Private - Only you can view</option>
              <option value="team">Team - Only team members can view</option>
            </select>
          </div>

          <div v-if="form.visibility === 'team'">
            <label for="team" class="label">Team</label>
            <select
              id="team"
              v-model="form.teamId"
              required
              class="input"
            >
              <option value="">Select a team</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">
                {{ team.displayName }}
              </option>
            </select>
          </div>

          <div>
            <label for="tags" class="label">Tags</label>
            <div class="flex gap-2 mb-2">
              <input
                v-model="tagInput"
                type="text"
                class="input flex-1"
                placeholder="Add a tag and press Enter"
                @keydown.enter.prevent="addTag"
              />
              <button
                type="button"
                @click="addTag"
                class="btn btn-secondary"
              >
                Add
              </button>
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
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Rule Content</h2>
        
        <div class="space-y-4">
          <div>
            <label for="format" class="label">Format</label>
            <select
              id="format"
              v-model="selectedFormat"
              class="input"
              @change="updateContentPlaceholder"
            >
              <option value="eslint">ESLint</option>
              <option value="prettier">Prettier</option>
              <option value="tsconfig">TypeScript Config</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label for="content" class="label">Content</label>
            <textarea
              id="content"
              v-model="form.content"
              rows="15"
              required
              class="input font-mono text-sm"
              :placeholder="contentPlaceholder"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4">
        <NuxtLink
          to="/rules"
          class="btn btn-secondary"
        >
          Cancel
        </NuxtLink>
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </span>
          <span v-else>Create Rule</span>
        </button>
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

useHead({
	title: "Create Rule - zxcv",
});

const form = ref({
	name: "",
	org: "",
	description: "",
	visibility: "public",
	teamId: "",
	tags: [],
	content: "",
});

const tagInput = ref("");
const selectedFormat = ref("eslint");
const teams = ref([]);
const loading = ref(false);
const error = ref("");

const contentPlaceholder = ref(`{
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "double"]
  }
}`);

const _updateContentPlaceholder = () => {
	switch (selectedFormat.value) {
		case "eslint":
			contentPlaceholder.value = `{
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "double"]
  }
}`;
			break;
		case "prettier":
			contentPlaceholder.value = `{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}`;
			break;
		case "tsconfig":
			contentPlaceholder.value = `{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true
  }
}`;
			break;
		default:
			contentPlaceholder.value = "// Your custom rule content here";
	}
};

const _addTag = () => {
	const tag = tagInput.value.trim().toLowerCase();
	if (tag && !form.value.tags.includes(tag)) {
		form.value.tags.push(tag);
		tagInput.value = "";
	}
};

const _removeTag = (index) => {
	form.value.tags.splice(index, 1);
};

const { $rpc } = useNuxtApp();

const _handleSubmit = async () => {
	loading.value = true;
	error.value = "";

	try {
		const response = await $rpc.rules.create(form.value);
		await navigateTo(`/rules/${response.id}`);
	} catch (err) {
		error.value = err.message || "Failed to create rule";
	} finally {
		loading.value = false;
	}
};

const fetchTeams = async () => {
	try {
		const response = await $rpc.teams.list();
		teams.value = response.results;
	} catch (error) {
		console.error("Failed to fetch teams:", error);
	}
};

onMounted(() => {
	const authStore = useAuthStore();
	if (!authStore.isAuthenticated) {
		navigateTo("/login");
	} else {
		fetchTeams();
	}
});
</script>