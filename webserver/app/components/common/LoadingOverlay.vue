<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="loading"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        <!-- Loading Content -->
        <div class="relative z-10">
          <slot name="loading">
            <!-- Advanced Loading Animation -->
            <div class="relative">
              <!-- Outer rotating ring -->
              <div class="absolute inset-0 rounded-full border-4 border-primary-200/20 animate-spin-slow" />
              
              <!-- Inner morphing shape -->
              <div class="relative w-24 h-24 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-accent-500 opacity-20 blur-xl animate-pulse" />
                <div class="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-accent-600 morph animate-float" />
                
                <!-- Logo or Icon -->
                <div class="relative z-10 text-white">
                  <slot name="icon">
                    <svg class="w-12 h-12 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </slot>
                </div>
              </div>
              
              <!-- Orbiting particles -->
              <div class="absolute inset-0">
                <div class="absolute top-0 left-1/2 w-2 h-2 -ml-1 rounded-full bg-primary-400 animate-orbit-1" />
                <div class="absolute top-0 left-1/2 w-2 h-2 -ml-1 rounded-full bg-accent-500 animate-orbit-2" />
                <div class="absolute top-0 left-1/2 w-2 h-2 -ml-1 rounded-full bg-primary-600 animate-orbit-3" />
              </div>
            </div>
            
            <!-- Loading Text -->
            <div v-if="text" class="mt-8 text-center">
              <p class="text-white font-medium animate-pulse">{{ text }}</p>
              <div class="mt-2 flex justify-center gap-1">
                <span class="w-2 h-2 rounded-full bg-white/60 animate-bounce" style="animation-delay: 0ms" />
                <span class="w-2 h-2 rounded-full bg-white/60 animate-bounce" style="animation-delay: 150ms" />
                <span class="w-2 h-2 rounded-full bg-white/60 animate-bounce" style="animation-delay: 300ms" />
              </div>
            </div>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
	loading: boolean;
	text?: string;
}

defineProps<Props>();
</script>

<style scoped>
/* Overlay transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.overlay-enter-active .relative {
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.overlay-leave-active .relative {
  animation: scaleOut 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Orbit animations */
@keyframes orbit-1 {
  0% {
    transform: rotate(0deg) translateX(40px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(40px) rotate(-360deg);
  }
}

@keyframes orbit-2 {
  0% {
    transform: rotate(120deg) translateX(40px) rotate(-120deg);
  }
  100% {
    transform: rotate(480deg) translateX(40px) rotate(-480deg);
  }
}

@keyframes orbit-3 {
  0% {
    transform: rotate(240deg) translateX(40px) rotate(-240deg);
  }
  100% {
    transform: rotate(600deg) translateX(40px) rotate(-600deg);
  }
}

.animate-orbit-1 {
  animation: orbit-1 3s linear infinite;
}

.animate-orbit-2 {
  animation: orbit-2 3s linear infinite;
}

.animate-orbit-3 {
  animation: orbit-3 3s linear infinite;
}
</style>