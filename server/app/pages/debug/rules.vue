<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="container-lg py-8">
      <h1 class="heading-1 mb-8">Rules Debug</h1>
      
      <div class="card mb-6">
        <h2 class="text-lg font-semibold mb-4">Database Status</h2>
        <CommonButton @click="checkDatabase" :loading="loading">
          Check Database
        </CommonButton>
        
        <div v-if="debugData" class="mt-4 space-y-4">
          <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded">
            <p class="font-semibold">Total Rules: {{ debugData.totalRules }}</p>
            <p class="font-semibold">Public Rules: {{ debugData.publicRules }}</p>
          </div>
          
          <div v-if="debugData.rules.length > 0">
            <h3 class="font-semibold mb-2">Rules in Database:</h3>
            <div class="space-y-2">
              <div
                v-for="rule in debugData.rules"
                :key="rule.id"
                class="bg-gray-100 dark:bg-gray-800 p-3 rounded"
              >
                <p><strong>Name:</strong> {{ rule.name }}</p>
                <p><strong>ID:</strong> {{ rule.id }}</p>
                <p><strong>Visibility:</strong> {{ rule.visibility }}</p>
                <p><strong>User ID:</strong> {{ rule.userId || 'null' }}</p>
                <p><strong>Username:</strong> {{ rule.username || 'unknown' }}</p>
              </div>
            </div>
          </div>
          <div v-else>
            <p class="text-gray-600 dark:text-gray-400">No rules found in database</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Search API Test</h2>
        <CommonButton @click="testSearchAPI" :loading="searchLoading">
          Test Search API
        </CommonButton>
        
        <div v-if="searchResult" class="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <pre>{{ JSON.stringify(searchResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRpc } from "~/app/composables/useRpc";

const $rpc = useRpc();
const loading = ref(false);
const searchLoading = ref(false);
const debugData = ref<any>(null);
const searchResult = ref<any>(null);

const checkDatabase = async () => {
	loading.value = true;
	try {
		debugData.value = await $rpc.rules.debug({});
	} catch (error) {
		console.error("Debug error:", error);
	} finally {
		loading.value = false;
	}
};

const testSearchAPI = async () => {
	searchLoading.value = true;
	try {
		searchResult.value = await $rpc.rules.search({
			limit: 12,
			page: 1,
		});
	} catch (error) {
		console.error("Search error:", error);
		searchResult.value = { error: String(error) };
	} finally {
		searchLoading.value = false;
	}
};
</script>