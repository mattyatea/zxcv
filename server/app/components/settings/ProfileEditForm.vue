<template>
	<div class="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
		<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
			{{ t('settings.profile.title') }}
		</h3>

		<form @submit.prevent="handleSubmit" class="space-y-6">
			<!-- Avatar Section -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					{{ t('settings.profile.avatar') }}
				</label>
				<div class="flex items-center space-x-4">
					<Avatar
						:src="props.user?.avatarUrl"
						:name="props.user?.displayName || props.user?.username || ''"
						:alt="t('settings.profile.avatarAlt')"
						size="2xl"
						shape="circle"
						:show-icon="!props.user?.avatarUrl"
						icon-name="heroicons:user-circle"
						:editable="true"
						@click="avatarInput?.click()"
					/>
					<div>
						<input
							ref="avatarInput"
							id="avatar-upload"
							type="file"
							accept="image/*"
							@change="handleAvatarChange"
							class="hidden"
						/>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							@click="avatarInput?.click()"
							:disabled="loading"
						>
							{{ t('settings.profile.changeAvatar') }}
						</Button>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
							{{ t('settings.profile.avatarHint') }}
						</p>
					</div>
				</div>
			</div>

			<!-- Display Name -->
			<div>
				<label for="displayName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{{ t('settings.profile.displayName') }}
				</label>
				<Input
					id="displayName"
					v-model="form.displayName"
					type="text"
					:placeholder="t('settings.profile.displayNamePlaceholder')"
					:disabled="loading"
					maxlength="100"
					class="mt-1"
				/>
			</div>

			<!-- Bio -->
			<div>
				<label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{{ t('settings.profile.bio') }}
				</label>
				<Textarea
					id="bio"
					v-model="form.bio"
					:placeholder="t('settings.profile.bioPlaceholder')"
					:disabled="loading"
					:rows="3"
					maxlength="500"
					class="mt-1"
				/>
				<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
					{{ (form.bio || '').length }}/500
				</p>
			</div>

			<!-- Location -->
			<div>
				<label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{{ t('settings.profile.location') }}
				</label>
				<Input
					id="location"
					v-model="form.location"
					type="text"
					:placeholder="t('settings.profile.locationPlaceholder')"
					:disabled="loading"
					maxlength="100"
					class="mt-1"
				/>
			</div>

			<!-- Website -->
			<div>
				<label for="website" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{{ t('settings.profile.website') }}
				</label>
				<Input
					id="website"
					v-model="form.website"
					type="url"
					:placeholder="t('settings.profile.websitePlaceholder')"
					:disabled="loading"
					class="mt-1"
				/>
			</div>

			<!-- Form Actions -->
			<div class="flex justify-end space-x-3">
				<Button
					type="button"
					variant="secondary"
					@click="resetForm"
					:disabled="loading || !hasChanges"
				>
					{{ t('common.cancel') }}
				</Button>
				<Button
					type="submit"
					:loading="loading"
					:disabled="loading || !hasChanges || !isFormValid"
				>
					{{ t('settings.profile.save') }}
				</Button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Button from "~/components/common/Button.vue";
import Input from "~/components/common/Input.vue";
import Textarea from "~/components/common/Textarea.vue";
import Avatar from "~/components/common/Avatar.vue";
import type { CurrentUser } from "~/types/user";

// Props
interface Props {
	user: CurrentUser | null;
	loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	loading: false,
});

// Emits
interface Emits {
	(
		e: "update",
		data: {
			displayName?: string;
			bio?: string;
			location?: string;
			website?: string;
		},
	): void;
	(e: "upload-avatar", file: File): void;
}

const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const { showToast } = useToast();

// Template refs
const avatarInput = ref<HTMLInputElement>();

// Form data
const form = ref({
	displayName: "",
	bio: "",
	location: "",
	website: "",
});

const originalForm = ref({
	displayName: "",
	bio: "",
	location: "",
	website: "",
});


// Form validation
const isFormValid = computed(() => {
	// Check if website is valid URL or empty
	if (form.value.website && form.value.website !== "") {
		try {
			new URL(form.value.website);
		} catch {
			return false;
		}
	}
	return true;
});

// Check if form has changes
const hasChanges = computed(() => {
	return (
		form.value.displayName !== originalForm.value.displayName ||
		form.value.bio !== originalForm.value.bio ||
		form.value.location !== originalForm.value.location ||
		form.value.website !== originalForm.value.website
	);
});

// Initialize form data when user prop changes
const initializeForm = () => {
	if (props.user) {
		form.value = {
			displayName: props.user.displayName || "",
			bio: props.user.bio || "",
			location: props.user.location || "",
			website: props.user.website || "",
		};
		originalForm.value = { ...form.value };
	}
};

// Watch for user changes
watch(() => props.user, initializeForm, { immediate: true });

// Handle form submission
const handleSubmit = () => {
	if (!isFormValid.value || !hasChanges.value) return;

	const updateData: any = {};

	if (form.value.displayName !== originalForm.value.displayName) {
		updateData.displayName = form.value.displayName || null;
	}
	if (form.value.bio !== originalForm.value.bio) {
		updateData.bio = form.value.bio || null;
	}
	if (form.value.location !== originalForm.value.location) {
		updateData.location = form.value.location || null;
	}
	if (form.value.website !== originalForm.value.website) {
		updateData.website = form.value.website || null;
	}

	emit("update", updateData);
	originalForm.value = { ...form.value };
};

// Reset form to original values
const resetForm = () => {
	form.value = { ...originalForm.value };
};

// Handle avatar file change
const handleAvatarChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];

	if (!file) return;

	// Validate file type
	if (!file.type.startsWith("image/")) {
		showToast({
			message: t('settings.profile.errors.invalidFileType'),
			type: "error",
		});
		return;
	}

	// Validate file size (5MB max)
	if (file.size > 5 * 1024 * 1024) {
		showToast({
			message: t('settings.profile.errors.fileTooLarge'),
			type: "error",
		});
		return;
	}

	emit("upload-avatar", file);

	// Reset input
	target.value = "";
};
</script>