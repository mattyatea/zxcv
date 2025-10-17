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
				// OneDark inspired - 落ち着いたプロフェッショナルカラー
				primary: {
					50: "#f8fafc",
					100: "#f1f5f9",
					200: "#e2e8f0",
					300: "#cbd5e1",
					400: "#94a3b8",
					500: "#64748b", // メインのスレートブルー
					600: "#475569",
					700: "#334155",
					800: "#1e293b",
					900: "#0f172a",
					950: "#020617",
				},
				// アクセントカラー - OneDarkのブルー
				accent: {
					50: "#eff6ff",
					100: "#dbeafe",
					200: "#bfdbfe",
					300: "#93c5fd",
					400: "#60a5fa",
					500: "#3b82f6", // メインのブルー
					600: "#2563eb",
					700: "#1d4ed8",
					800: "#1e40af",
					900: "#1e3a8a",
					950: "#172554",
				},
				// ウォームグレー - より温かみのあるグレー
				gray: {
					50: "#fafaf9",
					100: "#f5f5f4",
					200: "#e7e5e4",
					300: "#d6d3d1",
					400: "#a8a29e",
					500: "#78716c",
					600: "#57534e",
					700: "#44403c",
					800: "#292524",
					900: "#1c1917",
					950: "#0c0a09",
				},
				// セマンティックカラー - よりモダンな色合い
				success: {
					DEFAULT: "#16a34a",
					light: "#dcfce7",
					dark: "#15803d",
				},
				warning: {
					DEFAULT: "#ea580c",
					light: "#fed7aa",
					dark: "#c2410c",
				},
				danger: {
					DEFAULT: "#dc2626",
					light: "#fecaca",
					dark: "#991b1b",
				},
				info: {
					DEFAULT: "#0284c7",
					light: "#bfdbfe",
					dark: "#0369a1",
				},
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
