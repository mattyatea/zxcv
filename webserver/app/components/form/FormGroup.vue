<template>
  <div :class="['mb-4', className]">
    <FormLabel
      v-if="label"
      :for="htmlFor"
      :required="required"
      :error="!!error"
      class="mb-1"
    >
      {{ label }}
    </FormLabel>
    
    <slot />
    
    <FormError :error="error" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  required: false,
  error: '',
  class: ''
});

const className = computed(() => props.class);
</script>