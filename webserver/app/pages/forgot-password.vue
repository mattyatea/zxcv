<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <Transition name="slide-down" appear>
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <NuxtLink to="/" class="flex justify-center">
          <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center logo-animation shadow-2xl">
            <span class="text-2xl font-bold text-white">Z</span>
          </div>
        </NuxtLink>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ t('auth.forgotPassword.title') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {{ t('common.or') }}
          <NuxtLink to="/login"
                    class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 hover-underline">
            {{ t('auth.forgotPassword.backToLogin') }}
          </NuxtLink>
        </p>
      </div>
    </Transition>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <Card padding="lg" class="shadow-xl border-0 card-entrance">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <Transition name="fade-scale" mode="out-in">
            <div v-if="!submitted" key="form">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('auth.forgotPassword.email') }}
                </label>
                <div class="mt-1">
                  <input
                      id="email"
                      v-model="email"
                      name="email"
                      type="email"
                      autocomplete="email"
                      required
                      class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm input-focus-transition"
                      placeholder="example@example.com"
                  />
                </div>
              </div>

              <div class="mt-6">
                <Button type="submit" variant="primary" size="lg" full-width :loading="loading">
                  {{ t('auth.forgotPassword.sendButton') }}
                </Button>
              </div>
            </div>

            <div v-else key="success" class="text-center py-8">
              <div
                  class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 success-bounce">
                <svg class="h-6 w-6 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
                        class="checkmark-draw"/>
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">{{
                  t('auth.forgotPassword.emailSent')
                }}</h3>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {{ t('auth.forgotPassword.emailSentMessage') }}
              </p>
              <div class="mt-6">
                <NuxtLink to="/auth">
                  <Button variant="secondary" size="md">
                    {{ t('auth.forgotPassword.backToLogin') }}
                  </Button>
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Button from "~/components/common/Button.vue";
import Card from "~/components/common/Card.vue";

definePageMeta({
	layout: "auth",
});

const { t } = useI18n();

useHead({
	title: t("auth.forgotPassword.pageTitle"),
});

// const { $rpc } = useNuxtApp(); // TODO: Uncomment when implementing password reset
const toast = useToast();

const email = ref("");
const loading = ref(false);
const submitted = ref(false);

const handleSubmit = async () => {
	loading.value = true;
	try {
		// TODO: Implement password reset API call
		// await $rpc.auth.forgotPassword({ email: email.value });

		// For now, just simulate success
		await new Promise((resolve) => setTimeout(resolve, 1000));

		submitted.value = true;
		toast.success(t("auth.forgotPassword.success"));
	} catch (error) {
		console.error("Password reset error:", error);
		toast.error(t("auth.forgotPassword.error"));
	} finally {
		loading.value = false;
	}
};
</script>

<style scoped>
/* Logo animation from auth page */
@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(2deg);
  }
  75% {
    transform: translateY(5px) rotate(-2deg);
  }
}

.logo-animation {
  animation: logoFloat 6s ease-in-out infinite;
}

/* Slide down animation */
.slide-down-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

/* Success bounce animation */
@keyframes successBounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-bounce {
  animation: successBounce 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Checkmark drawing animation */
.checkmark-draw {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: drawCheckmark 0.5s ease-out 0.3s forwards;
}

@keyframes drawCheckmark {
  to {
    stroke-dashoffset: 0;
  }
}

/* Hover underline animation */
.hover-underline {
  position: relative;
}

.hover-underline::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: currentColor;
  transition: width 0.3s ease;
}

.hover-underline:hover::after {
  width: 100%;
}

/* Fade scale transition */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style>