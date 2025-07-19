<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          メールアドレスの確認
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          アカウントを有効化しています...
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center">
        <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Success state -->
      <div v-else-if="success" class="rounded-lg bg-green-50 dark:bg-green-900/20 p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
              確認完了
            </h3>
            <div class="mt-2 text-sm text-green-700 dark:text-green-300">
              <p>メールアドレスの確認が完了しました。</p>
              <p class="mt-1">ログインページからアカウントにアクセスできます。</p>
            </div>
            <div class="mt-4">
              <NuxtLink
                to="/login"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                ログインページへ
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/20 p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              確認エラー
            </h3>
            <div class="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{{ errorMessage }}</p>
            </div>
            <div class="mt-4 flex space-x-3">
              <NuxtLink
                to="/register"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                新規登録
              </NuxtLink>
              <button
                @click="resendVerification"
                :disabled="resending"
                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ resending ? '送信中...' : '確認メールを再送信' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No token state -->
      <div v-else class="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              確認トークンがありません
            </h3>
            <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>メールアドレスの確認にはトークンが必要です。</p>
              <p class="mt-1">登録時に送信されたメールのリンクをクリックしてください。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

useHead({
  title: 'メールアドレスの確認 - ZXCV'
})

const route = useRoute()
const { $rpc } = useNuxtApp()

const loading = ref(true)
const success = ref(false)
const error = ref(false)
const errorMessage = ref('')
const resending = ref(false)

const verifyEmail = async () => {
  const token = route.query.token
  
  if (!token) {
    loading.value = false
    return
  }
  
  try {
    const response = await $rpc.auth.verifyEmail({ token })
    
    if (response.success) {
      success.value = true
    } else {
      error.value = true
      errorMessage.value = response.message || 'メールアドレスの確認に失敗しました。'
    }
  } catch (err) {
    error.value = true
    errorMessage.value = err.message || '無効または期限切れの確認トークンです。'
  } finally {
    loading.value = false
  }
}

const resendVerification = async () => {
  resending.value = true
  
  // Get email from query parameter or prompt user
  const email = route.query.email || prompt('メールアドレスを入力してください:')
  
  if (!email) {
    resending.value = false
    return
  }
  
  try {
    const response = await $rpc.auth.sendVerification({ 
      email,
      locale: 'ja'
    })
    
    if (response.success) {
      alert('確認メールを送信しました。メールをご確認ください。')
    } else {
      alert(response.message || '確認メールの送信に失敗しました。')
    }
  } catch (err) {
    alert(err.message || 'エラーが発生しました。')
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
</script>