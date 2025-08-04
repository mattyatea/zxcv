<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">{{ $t('test.orpc.title') }}</h1>
    
    <div class="space-y-4">
      <button 
        @click="testHealth" 
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {{ $t('test.orpc.healthCheck') }}
      </button>
      
      <button 
        @click="testRuleCreate" 
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {{ $t('test.orpc.ruleCreate') }}
      </button>
      
      <div v-if="result" class="mt-4 p-4 bg-gray-100 rounded">
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      
      <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded">
        <pre>{{ JSON.stringify(error, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRpc } from "~/composables/useRpc";

const $rpc = useRpc();
const result = ref(null);
const error = ref(null);

const testHealth = async () => {
	try {
		error.value = null;
		result.value = await $rpc.health.check();
		console.log("Health check successful:", result.value);
	} catch (err) {
		error.value = err;
		console.error("Health check failed:", err);
	}
};

const testRuleCreate = async () => {
	try {
		error.value = null;
		result.value = await $rpc.rules.create({
			name: "test-rule",
			description: "Test rule from oRPC client",
			content: "# Test Rule\n\nThis is a test rule.",
			tags: ["test"],
			visibility: "public",
		});
		console.log("Rule create successful:", result.value);
	} catch (err) {
		error.value = err;
		console.error("Rule create failed:", err);
	}
};
</script>