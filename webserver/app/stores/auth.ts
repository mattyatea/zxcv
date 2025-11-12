import { defineStore } from "pinia";
import { useRpc } from "~/composables/useRpc";

interface AuthUser {
	id: string;
	email: string;
	username: string;
	emailVerified: boolean;
	displayName: string | null;
	avatarUrl: string | null;
}

interface AuthState {
	user: AuthUser | null;
	accessToken: string | null;
	refreshToken: string | null;
	isLoading: boolean;
	isInitialized: boolean;
}

interface LoginCredentials {
	email: string;
	password: string;
}

interface RegisterData {
	email: string;
	password: string;
	name: string;
	username: string;
}

export const useAuthStore = defineStore("auth", () => {
	// State
	const user = ref<AuthUser | null>(null);
	const accessToken = ref<string | null>(null);
	const refreshToken = ref<string | null>(null);
	const isLoading = ref(false);
	const isInitialized = ref(false);

	// Getters
	const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
	const isReady = computed(() => isInitialized.value); // ストアが初期化済みかどうか

	// Initialize from localStorage on client side
	const initializeAuth = async () => {
		if (import.meta.client) {
			const storedAccessToken = localStorage.getItem("access_token");
			const storedRefreshToken = localStorage.getItem("refresh_token");

			if (storedAccessToken) {
				accessToken.value = storedAccessToken;
			}
			if (storedRefreshToken) {
				refreshToken.value = storedRefreshToken;
			}

			// トークンがある場合は最新のユーザー情報を取得
			if (storedAccessToken) {
				await fetchCurrentUser();
			}
		}
		// 初期化完了をマーク
		isInitialized.value = true;
	};

	// Actions
	const login = async (credentials: LoginCredentials) => {
		isLoading.value = true;
		try {
			const $rpc = useRpc();
			const response = await $rpc.auth.login({
				email: credentials.email,
				password: credentials.password,
			});

			// Store tokens and user data
			accessToken.value = response.accessToken;
			refreshToken.value = response.refreshToken;
			user.value = response.user;

			// Persist tokens to localStorage (but not user data)
			if (import.meta.client) {
				localStorage.setItem("access_token", response.accessToken);
				localStorage.setItem("refresh_token", response.refreshToken);
			}

			return response;
		} catch (error) {
			// Clear any existing auth data on error
			await logout();
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const register = async (data: RegisterData) => {
		isLoading.value = true;
		try {
			const $rpc = useRpc();
			const response = await $rpc.auth.register(data);

			// After successful registration, log the user in
			await login({
				email: data.email,
				password: data.password,
			});

			return response;
		} finally {
			isLoading.value = false;
		}
	};

	const logout = async () => {
		// Clear state
		user.value = null;
		accessToken.value = null;
		refreshToken.value = null;

		// Clear tokens from localStorage
		if (import.meta.client) {
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			// localStorage.removeItem("user"); // ユーザー情報は保存していないので削除不要
		}

		// Navigate to login
		await navigateTo("/login");
	};

	const refreshAccessToken = async () => {
		if (!refreshToken.value) {
			throw new Error("No refresh token available");
		}

		try {
			const $rpc = useRpc();
			const response = await $rpc.auth.refresh({
				refreshToken: refreshToken.value,
			});

			// Update tokens
			accessToken.value = response.accessToken;
			refreshToken.value = response.refreshToken;

			// Update localStorage
			if (import.meta.client) {
				localStorage.setItem("access_token", response.accessToken);
				localStorage.setItem("refresh_token", response.refreshToken);
			}

			return response;
		} catch (error) {
			// If refresh fails, logout user
			await logout();
			throw error;
		}
	};

	const fetchCurrentUser = async () => {
		if (!accessToken.value) {
			return null;
		}

		try {
			const $rpc = useRpc();
			const response = await $rpc.users.me();
			user.value = {
				id: response.id,
				email: response.email,
				username: response.username,
				emailVerified: response.emailVerified,
				displayName: response.displayName,
				avatarUrl: response.avatarUrl,
			};

			// localStorageにユーザー情報は保存しない（毎回サーバーから取得）

			return response;
		} catch (error) {
			console.error("Failed to fetch current user:", error);
			return null;
		}
	};

	const updateUser = (updatedUser: Partial<AuthUser>) => {
		if (!user.value) {
			return;
		}

		// Update user data
		user.value = {
			...user.value,
			...updatedUser,
		};

		// localStorageは更新しない（次回アクセス時にサーバーから取得）
	};

	const setAuthData = async (data: {
		accessToken: string;
		refreshToken: string;
		user: AuthUser;
	}) => {
		// Update state
		accessToken.value = data.accessToken;
		refreshToken.value = data.refreshToken;
		user.value = data.user;

		// Persist tokens to localStorage (but not user data)
		if (import.meta.client) {
			localStorage.setItem("access_token", data.accessToken);
			localStorage.setItem("refresh_token", data.refreshToken);
		}
	};

	// トークンの有効性を確認
	const validateToken = async () => {
		if (!accessToken.value) {
			return false;
		}

		try {
			const $rpc = useRpc();
			await $rpc.users.me();
			return true;
		} catch (error) {
			console.log("Token validation failed:", error);

			// エラーの種類をチェックして認証エラーの場合はトークンをクリア
			const isAuthError =
				(error && typeof error === "object" && "status" in error && error.status === 401) ||
				(error &&
					typeof error === "object" &&
					"message" in error &&
					typeof error.message === "string" &&
					(error.message.includes("UNAUTHORIZED") || error.message.includes("User not found")));

			if (isAuthError) {
				await logout();
				return false;
			}

			// その他のエラー（ネットワークエラーなど）の場合は現在の状態を維持
			return true;
		}
	};

	// Initialize on store creation
	initializeAuth().catch((error) => {
		console.error("Auth initialization failed:", error);
		isInitialized.value = true; // エラーでも初期化完了とマーク
	});

	return {
		// State
		user: readonly(user),
		accessToken: readonly(accessToken),
		refreshToken: readonly(refreshToken),
		isLoading: readonly(isLoading),
		isInitialized: readonly(isInitialized),
		// Getters
		isAuthenticated,
		isReady,
		// Actions
		login,
		register,
		logout,
		refreshAccessToken,
		fetchCurrentUser,
		updateUser,
		setAuthData,
		initializeAuth,
		validateToken,
	};
});
