<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden auth-layout">
    <!-- Header with fade-in animation -->
    <Transition name="slide-down" appear>
      <LayoutHeader />
    </Transition>
    
    <!-- Main content with animated background -->
    <div class="flex-1 flex relative">
      <!-- Animated gradient background -->
      <div class="absolute inset-0 z-0">
        <!-- Primary gradient layer with dynamic colors -->
        <div 
          class="absolute inset-0 grid-slide-bg"
          :class="{ 
            'grid-slide-left bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600': isLoginTab, 
            'grid-slide-right bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600': !isLoginTab 
          }"
        >
          <!-- Animated mesh gradient overlay -->
          <div class="absolute inset-0 opacity-30">
            <div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent animate-pulse-slow" />
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse-slow animation-delay-2s" />
          </div>
          
          <!-- Grid pattern overlay -->
          <div class="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] grid-pattern" />
          
          <!-- Multiple floating orbs for depth -->
          <div class="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl floating-orb orb-1" />
          <div class="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl floating-orb orb-2" />
          <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl floating-orb orb-3" />
          <div class="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl floating-orb orb-4" />
          
          <!-- Animated particles -->
          <div class="particles-container">
            <div class="particle particle-1" />
            <div class="particle particle-2" />
            <div class="particle particle-3" />
            <div class="particle particle-4" />
            <div class="particle particle-5" />
          </div>
        </div>
        
        <!-- Glass morphism overlay -->
        <div class="absolute inset-0 backdrop-blur-[2px] bg-black/5" />
      </div>
      
      <!-- Content with entrance animation -->
      <div class="relative z-10 w-full">
        <Transition name="fade-scale" appear mode="out-in">
          <slot />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isLoginTab = computed(() => {
	// Check if we're on auth page with login tab or old login page
	return (
		route.path === "/login" ||
		(route.path === "/auth" && route.query.tab !== "register")
	);
});
</script>

<style scoped>
/* Layout base styles */
.auth-layout {
  animation: layoutFadeIn 0.8s ease-out;
  background: #000;
}

@keyframes layoutFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* Background slide animation */
.grid-slide-bg {
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  width: 200%;
  will-change: transform, background;
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.grid-slide-left {
  transform: translateX(0);
}

.grid-slide-right {
  transform: translateX(-50%);
}

/* Animated grid pattern */
.grid-pattern {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: grid-slide 30s linear infinite;
}

@keyframes grid-slide {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(60px, 60px);
  }
}

/* Floating orbs animation */
.floating-orb {
  animation: float 20s ease-in-out infinite;
  will-change: transform;
  filter: blur(40px);
}

.orb-1 {
  animation-duration: 25s;
  animation-delay: 0s;
}

.orb-2 {
  animation-duration: 30s;
  animation-delay: 5s;
}

.orb-3 {
  animation-duration: 35s;
  animation-delay: 10s;
}

.orb-4 {
  animation-duration: 40s;
  animation-delay: 15s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  25% {
    transform: translate(50px, -50px) scale(1.1) rotate(90deg);
  }
  50% {
    transform: translate(-30px, 30px) scale(0.9) rotate(180deg);
  }
  75% {
    transform: translate(40px, 20px) scale(1.05) rotate(270deg);
  }
}

/* Animated particles */
.particles-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  opacity: 0;
  animation: particleFloat 15s infinite;
}

.particle-1 {
  left: 10%;
  animation-delay: 0s;
  animation-duration: 13s;
}

.particle-2 {
  left: 30%;
  animation-delay: 3s;
  animation-duration: 17s;
}

.particle-3 {
  left: 50%;
  animation-delay: 6s;
  animation-duration: 20s;
}

.particle-4 {
  left: 70%;
  animation-delay: 9s;
  animation-duration: 15s;
}

.particle-5 {
  left: 90%;
  animation-delay: 12s;
  animation-duration: 18s;
}

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: translateY(100vh) scale(0);
  }
  10% {
    opacity: 0.5;
    transform: translateY(80vh) scale(1);
  }
  90% {
    opacity: 0.5;
    transform: translateY(10vh) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-10vh) scale(0);
  }
}

/* Pulse animations */
.animate-pulse-slow {
  animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

.animation-delay-2s {
  animation-delay: 2s;
}

/* Header slide down animation */
.slide-down-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

/* Content fade and scale animation */
.fade-scale-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(30px);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .grid-pattern,
  .floating-orb,
  .grid-slide-bg,
  .particle,
  .animate-pulse-slow {
    animation: none !important;
  }
  
  .grid-slide-bg {
    transition-duration: 0.3s !important;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .floating-orb {
    filter: blur(60px);
  }
  
  .particle {
    display: none;
  }
}
</style>