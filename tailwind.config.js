/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./components/**/*.{js,vue,ts}",
		"./layouts/**/*.vue",
		"./pages/**/*.vue",
		"./plugins/**/*.{js,ts}",
		"./app.vue",
		"./error.vue",
	],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				// シンプルでモダンなカラーパレット
				primary: {
					50: "#f0f9ff",
					100: "#e0f2fe",
					200: "#bae6fd",
					300: "#7dd3fc",
					400: "#38bdf8",
					500: "#0ea5e9",
					600: "#0284c7",
					700: "#0369a1",
					800: "#075985",
					900: "#0c4a6e",
					950: "#082f49",
				},
				gray: {
					50: "#f9fafb",
					100: "#f3f4f6",
					200: "#e5e7eb",
					300: "#d1d5db",
					400: "#9ca3af",
					500: "#6b7280",
					600: "#4b5563",
					700: "#374151",
					800: "#1f2937",
					900: "#111827",
					950: "#030712",
				},
				// 成功・エラー・警告用のシンプルな色
				success: "#10b981",
				warning: "#f59e0b",
				danger: "#ef4444",
				info: "#3b82f6",
			},
			fontFamily: {
				sans: [
					"M PLUS 1",
					"Inter",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"Roboto",
					"Helvetica Neue",
					"Arial",
					"Noto Sans",
					"sans-serif",
				],
				mono: [
					"JetBrains Mono",
					"Menlo",
					"Monaco",
					"Consolas",
					"Liberation Mono",
					"Courier New",
					"monospace",
				],
			},
			boxShadow: {
				// よりソフトでモダンなシャドウ
				sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
				DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
				md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
				lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
				xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
				"2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
				inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
			},
			animation: {
				// シンプルなアニメーション
				"fade-in": "fadeIn 0.5s ease-in-out",
				"fade-out": "fadeOut 0.5s ease-in-out",
				"slide-up": "slideUp 0.3s ease-out",
				"slide-down": "slideDown 0.3s ease-out",
				pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				float: "float 6s ease-in-out infinite",
				"scale-in": "scaleIn 0.2s ease-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				fadeOut: {
					"0%": { opacity: "1" },
					"100%": { opacity: "0" },
				},
				slideUp: {
					"0%": { transform: "translateY(100%)" },
					"100%": { transform: "translateY(0)" },
				},
				slideDown: {
					"0%": { transform: "translateY(-100%)" },
					"100%": { transform: "translateY(0)" },
				},
				pulse: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: ".5" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-20px)" },
				},
				scaleIn: {
					"0%": { transform: "scale(0.95)", opacity: "0" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
			},
			// ボーダー半径のカスタマイズ
			borderRadius: {
				sm: "0.25rem",
				DEFAULT: "0.375rem",
				md: "0.5rem",
				lg: "0.75rem",
				xl: "1rem",
				"2xl": "1.5rem",
				"3xl": "2rem",
			},
		},
	},
	plugins: [
		// フォームスタイリング用プラグイン
		require("@tailwindcss/forms")({
			strategy: "class",
		}),
		// タイポグラフィプラグイン
		require("@tailwindcss/typography"),
	],
};