import { defineStore } from "pinia";

interface AuthUser {
	id: string;
	email: string;
	username: string;
	emailVerified: boolean;
}

interface AuthState {
	user: AuthUser | null;
	accessToken: string | null;
	refreshToken: string | null;
	isLoading: boolean;
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

	// Getters
	const isAuthenticated = computed(() => !!user.value && !!accessToken.value);

	// Initialize from localStorage on client side
	const initializeAuth = () => {
		if (import.meta.client) {
			const storedAccessToken = localStorage.getItem("access_token");
			const storedRefreshToken = localStorage.getItem("refresh_token");
			const storedUser = localStorage.getItem("user");

			if (storedAccessToken) {
				accessToken.value = storedAccessToken;
			}
			if (storedRefreshToken) {
				refreshToken.value = storedRefreshToken;
			}
			if (storedUser) {
				try {
					user.value = JSON.parse(storedUser);
				} catch (e) {
					console.error("Failed to parse stored user data:", e);
				}
			}
		}
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

			// Persist to localStorage
			if (import.meta.client) {
				localStorage.setItem("access_token", response.accessToken);
				localStorage.setItem("refresh_token", response.refreshToken);
				localStorage.setItem("user", JSON.stringify(response.user));
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

		// Clear localStorage
		if (import.meta.client) {
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			localStorage.removeItem("user");
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
			const response = await $rpc.users.settings();
			user.value = {
				id: response.id,
				email: response.email,
				username: response.username,
				emailVerified: response.email_verified,
			};

			// Update localStorage
			if (import.meta.client) {
				localStorage.setItem("user", JSON.stringify(response));
			}

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

		// Update localStorage
		if (import.meta.client) {
			localStorage.setItem("user", JSON.stringify(user.value));
		}
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

		// Persist to localStorage
		if (import.meta.client) {
			localStorage.setItem("access_token", data.accessToken);
			localStorage.setItem("refresh_token", data.refreshToken);
			localStorage.setItem("user", JSON.stringify(data.user));
		}
	};

	// Initialize on store creation
	initializeAuth();

	return {
		// State
		user: readonly(user),
		accessToken: readonly(accessToken),
		refreshToken: readonly(refreshToken),
		isLoading: readonly(isLoading),
		// Getters
		isAuthenticated,
		// Actions
		login,
		register,
		logout,
		refreshAccessToken,
		fetchCurrentUser,
		updateUser,
		setAuthData,
		initializeAuth,
	};
});
