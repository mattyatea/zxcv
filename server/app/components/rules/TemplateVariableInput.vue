<template>
	<div v-if="variables.length > 0" class="template-variable-input">
		<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
			<div class="flex items-start gap-3">
				<svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<div class="flex-1">
					<h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
						{{ t('rules.template.title') }}
					</h3>
					<p class="text-sm text-blue-700 dark:text-blue-300">
						{{ t('rules.template.description') }}
					</p>
				</div>
			</div>
		</div>

		<div class="space-y-4">
			<div v-for="variable in variables" :key="variable.name" class="template-variable-field">
				<label :for="`var-${variable.name}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					{{ variable.name }}
					<span v-if="variable.description" class="text-gray-500 dark:text-gray-400 font-normal">
						- {{ variable.description }}
					</span>
				</label>
				<CommonInput
					:id="`var-${variable.name}`"
					v-model="localValues[variable.name]"
					:placeholder="variable.defaultValue || t('rules.template.placeholder', { name: variable.name })"
					@input="handleInput"
				/>
			</div>
		</div>

		<div v-if="hasValues" class="mt-6 flex items-center justify-between">
			<CommonButton
				variant="outline"
				size="sm"
				@click="handleClear"
			>
				<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
				{{ t('rules.template.clear') }}
			</CommonButton>
			<CommonButton
				variant="primary"
				size="sm"
				@click="handleApply"
			>
				<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				{{ t('rules.template.apply') }}
			</CommonButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface TemplateVariable {
	name: string
	defaultValue?: string
	description?: string
}

interface Props {
	variables: TemplateVariable[]
	modelValue?: Record<string, string>
}

interface Emits {
	(e: 'update:modelValue', value: Record<string, string>): void
	(e: 'apply', value: Record<string, string>): void
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: () => ({}),
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

// Local state for input values
const localValues = ref<Record<string, string>>({ ...props.modelValue })

// Check if any values are filled
const hasValues = computed(() => {
	return Object.values(localValues.value).some(v => v && v.trim() !== '')
})

// Handle input changes
const handleInput = () => {
	emit('update:modelValue', { ...localValues.value })
}

// Handle clear all
const handleClear = () => {
	localValues.value = {}
	emit('update:modelValue', {})
}

// Handle apply
const handleApply = () => {
	emit('apply', { ...localValues.value })
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
	localValues.value = { ...newValue }
}, { deep: true })
</script>

<style scoped>
.template-variable-input {
	/* Additional styling if needed */
}

.template-variable-field {
	/* Field-specific styling */
}
</style>
