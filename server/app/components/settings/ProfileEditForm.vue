<template>
	<div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
		<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
			{{ t('settings.profile.title') }}
		</h3>

		<form @submit.prevent="handleSubmit" class="space-y-6">
			<!-- Avatar Section -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					{{ t('settings.profile.avatar') }}
				</label>
				<div class="flex items-center space-x-4">
					<div class="relative">
						<div
							class="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden"
						>
							<img
								v-if="displayAvatarUrl"
								:src="displayAvatarUrl"
								:alt="t('settings.profile.avatarAlt')"
								class="h-full w-full object-cover"
							/>
							<Icon
								v-else
								name="heroicons:user-circle"
								class="h-16 w-16 text-gray-400"
							/>
						</div>
						<label
							for="avatar-upload"
							class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
						>
							<Icon name="heroicons:camera" class="h-6 w-6 text-white" />
						</label>
					</div>
					<div>
						<input
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
							@click="$refs.avatarInput?.click()"
							:disabled="loading"
						>
							{{ t('settings.profile.changeAvatar') }}
						</Button>
						<p class="text-xs text-gray-500 mt-1">
							{{ t('settings.profile.avatarHint') }}
						</p>
					</div>
				</div>
			</div>

			<!-- Display Name -->
			<div>
				<label for="displayName" class="block text-sm font-medium text-gray-700">
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
				<label for="bio" class="block text-sm font-medium text-gray-700">
					{{ t('settings.profile.bio') }}
				</label>
				<Textarea
					id="bio"
					v-model="form.bio"
					:placeholder="t('settings.profile.bioPlaceholder')"
					:disabled="loading"
					rows="3"
					maxlength="500"
					class="mt-1"
				/>
				<p class="text-xs text-gray-500 mt-1">
					{{ (form.bio || '').length }}/500
				</p>
			</div>

			<!-- Location -->
			<div>
				<label for="location" class="block text-sm font-medium text-gray-700">
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
				<label for="website" class="block text-sm font-medium text-gray-700">
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
import type { UserProfile } from "~/types/user";

// Props
interface Props {
	user: UserProfile | null;
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

// Avatar display URL (for preview)
const displayAvatarUrl = computed(() => {
	if (!props.user?.avatarUrl) return null;
	// If it's already a full URL, return as-is
	if (props.user.avatarUrl.startsWith("http")) return props.user.avatarUrl;
	// Otherwise, construct the R2 public URL (this will need to be configured)
	return `/api/avatars/${props.user.avatarUrl}`;
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
		// Show error toast
		return;
	}

	// Validate file size (5MB max)
	if (file.size > 5 * 1024 * 1024) {
		// Show error toast
		return;
	}

	emit("upload-avatar", file);

	// Reset input
	target.value = "";
};
</script>