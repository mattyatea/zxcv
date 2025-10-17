import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
	// サーバーサイドでは認証チェックをスキップ
	if (!import.meta.client) {
		return;
	}

	const authStore = useAuthStore();
	const { isAuthenticated, isReady } = storeToRefs(authStore);

	// ストアの初期化を待つ（最大500ms）
	let attempts = 0;
	while (!isReady.value && attempts < 50) {
		await new Promise((resolve) => setTimeout(resolve, 10));
		attempts++;
	}

	// 初期化完了後に認証チェック
	if (!isAuthenticated.value) {
		// Save the attempted route for redirect after login
		const redirectPath = to.fullPath;
		return navigateTo(`/login?redirect=${encodeURIComponent(redirectPath)}`);
	}
});
