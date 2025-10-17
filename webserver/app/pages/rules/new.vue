<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('rules.createNewRule') }}</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ t('rules.shareWithCommunity') }}
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('rules.basicInfo') }}</h2>
        
        <div class="space-y-4">
          <div>
            <label for="name" class="label">{{ t('rules.form.name') }}</label>
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
              {{ t('rules.form.nameHint') }}
            </p>
          </div>


          <div>
            <label for="type" class="label">{{ t('rules.form.type') }}</label>
            <select
              id="type"
              v-model="form.type"
              class="input"
            >
              <option value="rule">{{ t('rules.form.typeOptions.rule') }}</option>
              <option value="ccsubagents">{{ t('rules.form.typeOptions.ccsubagents') }}</option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ t('rules.form.typeHint') }}
            </p>
          </div>

          <div>
            <label for="description" class="label">{{ t('rules.form.description') }}</label>
            <textarea
              id="description"
              v-model="form.description"
              :rows="3"
              class="input"
              :placeholder="t('rules.form.descriptionPlaceholder')"
            />
          </div>

          <div v-if="form.type === 'ccsubagents'" class="mt-4">
            <label for="agentTemplate" class="label">{{ t('rules.form.agentTemplate') }}</label>
            <select
              id="agentTemplate"
              v-model="selectedTemplate"
              @change="applyTemplate"
              class="input"
            >
              <option value="">{{ t('rules.form.selectTemplate') }}</option>
              <option value="codeReviewer">{{ t('rules.templates.codeReviewer') }}</option>
              <option value="testGenerator">{{ t('rules.templates.testGenerator') }}</option>
              <option value="docWriter">{{ t('rules.templates.docWriter') }}</option>
              <option value="generalHelper">{{ t('rules.templates.generalHelper') }}</option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ t('rules.form.templateHint') }}
            </p>
          </div>

          <div>
            <label for="visibility" class="label">{{ t('rules.form.visibility') }}</label>
            <select
              id="visibility"
              v-model="form.visibility"
              class="input"
            >
              <option value="public">{{ t('rules.form.visibilityOptions.public') }}</option>
              <option value="private">{{ t('rules.form.visibilityOptions.private') }}</option>
            </select>
          </div>

          <div>
            <label for="organization" class="label">{{ t('rules.form.organization') }} ({{ t('common.optional') }})</label>
            <select
              id="organization"
              v-model="selectedOrganizationId"
              class="input"
              @change="updateOrganization"
            >
              <option value="">{{ t('rules.form.noOrganization') }}</option>
              <option v-for="organization in organizations" :key="organization.id" :value="organization.id">
                {{ organization.displayName }}
              </option>
            </select>
            <p v-if="form.org" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ t('rules.form.urlPreview') }} @{{ form.org }}/{{ form.name || 'rule-name' }}
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ t('rules.form.organizationHint') }}
            </p>
          </div>

          <div>
            <label for="tags" class="label">{{ t('rules.form.tags') }}</label>
            <div class="flex gap-2 mb-2">
              <input
                v-model="tagInput"
                type="text"
                class="input flex-1"
                :placeholder="t('rules.form.tagsPlaceholder')"
                @keydown.enter.prevent="addTag"
              />
              <Button
                type="button"
                @click="addTag"
                variant="secondary"
                size="sm"
              >
                {{ t('rules.form.addTag') }}
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
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ form.type === 'ccsubagents' ? t('rules.agentContent') : t('rules.ruleContent') }}
        </h2>
        
        <div class="space-y-4">
          <div>
            <label for="content" class="label">{{ t('rules.form.content') }}</label>
            <div class="mb-2">
              <Button
                type="button"
                @click="showFileUpload = !showFileUpload"
                variant="ghost"
                size="sm"
              >
                {{ showFileUpload ? t('rules.form.writeDirectly') : t('rules.form.uploadMarkdown') }}
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
              :rows="15"
              required
              class="input font-mono text-sm"
              :placeholder="form.type === 'ccsubagents' ? t('rules.form.agentContentPlaceholder') : t('rules.form.contentPlaceholder')"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ t('rules.form.markdownSupported') }}
              <span v-if="form.type === 'ccsubagents'" class="block mt-1">
                {{ t('rules.form.agentTemplateHint') }}
              </span>
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
          {{ t('common.cancel') }}
        </Button>
        <Button
          type="submit"
          :loading="loading"
          :disabled="loading"
          variant="primary"
        >
          {{ loading ? t('rules.creating') : t('rules.createRule') }}
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
import { useRpc } from "~/composables/useRpc";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
	middleware: "auth",
});

const { t } = useI18n();

useHead({
	title: t("rules.newRuleTitle"),
});

const form = ref({
	name: "",
	type: "rule",
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
const selectedTemplate = ref("");

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
	const selected = organizations.value.find(
		(org) => org.id === selectedOrganizationId.value,
	);
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
				await navigateTo(
					`/rules/@${authStore.user.username}/${form.value.name}`,
				);
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

const applyTemplate = () => {
	if (!selectedTemplate.value) return;

	// Subagentテンプレートを適用
	const templates = {
		codeReviewer: `# Code Review Expert

An expert agent for comprehensive code review and quality assessment

## Type
code-reviewer

## Capabilities
- Security vulnerability detection
- Performance analysis
- Code style validation
- Best practices enforcement
- Dependency analysis

## Tools
- Read
- Grep
- Task

## Instructions
This agent specializes in code review and quality assessment.

### Primary Responsibilities:
1. Review code for best practices and patterns
2. Identify potential bugs and security issues
3. Suggest performance improvements
4. Check code consistency and style
5. Validate test coverage

### Review Process:
1. Analyze the code structure and architecture
2. Check for common anti-patterns
3. Verify error handling and edge cases
4. Assess code readability and maintainability
5. Provide constructive feedback with examples`,

		testGenerator: `# Test Suite Generator

Generates comprehensive test suites for your codebase

## Type
test-generator

## Capabilities
- Unit test generation
- Integration test creation
- E2E test scenarios
- Test data generation
- Coverage analysis

## Tools
- Read
- Write
- MultiEdit

## Instructions
This agent specializes in generating comprehensive test suites.

### Primary Responsibilities:
1. Generate unit tests for functions and methods
2. Create integration tests for APIs
3. Design edge case scenarios
4. Generate test data and fixtures
5. Ensure adequate test coverage`,

		docWriter: `# Documentation Specialist

Creates and maintains high-quality technical documentation

## Type
documentation

## Capabilities
- API documentation
- User guides
- Code comments
- Architecture docs
- Tutorial creation

## Tools
- Read
- Write
- Grep

## Instructions
This agent specializes in creating and maintaining documentation.

### Primary Responsibilities:
1. Generate API documentation
2. Create user guides and tutorials
3. Write code comments and docstrings
4. Maintain README files
5. Create architectural documentation`,

		generalHelper: `# Development Assistant

A versatile assistant for various development tasks

## Type
general

## Capabilities
- Code implementation
- Bug fixing
- Refactoring
- Performance optimization
- Technical guidance

## Tools
- * (All available tools)

## Instructions
This is a general-purpose agent for various development tasks.

### Primary Responsibilities:
1. Assist with code implementation
2. Debug and troubleshoot issues
3. Refactor and optimize code
4. Answer technical questions
5. Provide development guidance`,
	};

	if (templates[selectedTemplate.value]) {
		form.value.content = templates[selectedTemplate.value];
	}
};

onMounted(() => {
	fetchOrganizations();
});
</script>