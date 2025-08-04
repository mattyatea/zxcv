<template>
  <div :class="containerClasses">
    <img 
      v-if="src"
      :src="src"
      :alt="alt"
      :class="imageClasses"
      @error="handleImageError"
    />
    <div
      v-else
      :class="[imageClasses, 'flex items-center justify-center font-medium', colorClasses]"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  name: '',
  size: 'md',
  shape: 'circle',
  class: ''
});

const hasError = ref(false);

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

const containerClasses = computed(() => [
  'relative inline-block',
  sizeClasses[props.size],
  props.class
]);

const imageClasses = computed(() => [
  'w-full h-full object-cover',
  props.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
]);

const initials = computed(() => {
  if (!props.name) return '?';
  return props.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const colorClasses = computed(() => {
  // Generate consistent color based on name
  const colors = [
    'bg-red-500 text-white',
    'bg-orange-500 text-white',
    'bg-amber-500 text-white',
    'bg-yellow-500 text-white',
    'bg-lime-500 text-white',
    'bg-green-500 text-white',
    'bg-emerald-500 text-white',
    'bg-teal-500 text-white',
    'bg-cyan-500 text-white',
    'bg-sky-500 text-white',
    'bg-blue-500 text-white',
    'bg-indigo-500 text-white',
    'bg-violet-500 text-white',
    'bg-purple-500 text-white',
    'bg-fuchsia-500 text-white',
    'bg-pink-500 text-white',
    'bg-rose-500 text-white'
  ];
  
  const hash = props.name.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[hash % colors.length];
});

const handleImageError = () => {
  hasError.value = true;
};
</script>