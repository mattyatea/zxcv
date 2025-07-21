import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", () => {
	const isDark = ref(false);

	// Initialize theme from localStorage or system preference
	const initializeTheme = () => {
		if (process.client) {
			const savedTheme = localStorage.getItem("theme");
			if (
				savedTheme === "dark" ||
				(!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
			) {
				isDark.value = true;
				document.documentElement.classList.add("dark");
			} else {
				isDark.value = false;
				document.documentElement.classList.remove("dark");
			}
		}
	};

	// Toggle theme
	const toggleTheme = () => {
		isDark.value = !isDark.value;
		if (isDark.value) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	};

	// Set theme explicitly
	const setTheme = (dark: boolean) => {
		isDark.value = dark;
		if (dark) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	};

	return {
		isDark: readonly(isDark),
		initializeTheme,
		toggleTheme,
		setTheme,
	};
});
