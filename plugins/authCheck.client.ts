export default defineNuxtPlugin(async (nuxtApp) => {
	// クライアントサイドでのみ実行
	if (!process.client) {
		return;
	}

	const { $rpc } = nuxtApp as any;

	// 初期化時に認証状態をチェック
	const checkAuthStatus = async () => {
		const accessToken = localStorage.getItem("access_token");
		const refreshToken = localStorage.getItem("refresh_token");

		// トークンがない場合はスキップ
		if (!accessToken || !refreshToken) {
			return;
		}

		try {
			// プロフィール取得を試みて認証状態を確認
			await $rpc.users.me();
		} catch (error: any) {
			console.error("Auth check failed:", error);

			// 401 Unauthorized または 500 エラーの場合
			if (
				error?.status === 401 ||
				error?.status === 500 ||
				error?.message?.includes("UNAUTHORIZED") ||
				error?.message?.includes("User not found") ||
				error?.message?.includes("FOREIGN KEY constraint failed")
			) {
				console.log("Invalid token detected, clearing auth data...");

				// トークンをクリア
				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");
				localStorage.removeItem("user");

				// リダイレクト（現在のページがログインページでない場合）
				const route = useRoute();
				if (route.path !== "/login" && route.path !== "/register") {
					await navigateTo("/login");
				}
			}
		}
	};

	// アプリ起動時にチェック
	await checkAuthStatus();

	// ルート変更時にもチェック（オプション）
	nuxtApp.hook("page:finish", async () => {
		// 頻繁にチェックしすぎないように、一定の条件下でのみ実行
		const route = useRoute();
		if (route.meta.requiresAuth) {
			await checkAuthStatus();
		}
	});
});
