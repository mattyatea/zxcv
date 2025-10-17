<template>
	<div
		:class="[
			'relative overflow-hidden flex items-center justify-center',
			containerClasses,
			ringClass
		]"
	>
		<!-- 画像がある場合 -->
		<img
			v-if="processedSrc && !hasError"
			:src="processedSrc"
			:alt="alt"
			:class="imageClasses"
			@error="handleImageError"
		/>

		<!-- 画像がない場合またはエラー時のフォールバック -->
		<div
			v-else
			:class="[
				imageClasses,
				'flex items-center justify-center font-medium',
				fallbackClasses
			]"
		>
			<!-- アイコンまたは文字 -->
			<Icon
				v-if="showIcon"
				:name="iconName"
				:class="iconSizeClass"
			/>
			<span
				v-else-if="initials"
				:class="textSizeClass"
			>
				{{ initials }}
			</span>
		</div>

		<!-- オーバーレイ（編集可能な場合） -->
		<div
			v-if="editable"
			:class="[
				'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity',
				props.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
			]"
			@click="$emit('click')"
		>
			<Icon
				name="heroicons:camera"
				class="text-white"
				:class="overlayIconSizeClass"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

// Props
interface Props {
	/** アバター画像のURL */
	src?: string | null;
	/** 代替テキスト */
	alt?: string;
	/** ユーザー名またはディスプレイ名（イニシャル生成用） */
	name?: string;
	/** アバターのサイズ */
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
	/** 形状（circle: 円形、square: 角丸四角形） */
	shape?: "circle" | "square";
	/** 追加のCSSクラス */
	class?: string;
	/** 編集可能（ホバー時にカメラアイコン表示） */
	editable?: boolean;
	/** リング（境界線）を表示 */
	ring?: boolean;
	/** リングの色 */
	ringColor?: string;
	/** フォールバック時にアイコンを表示（false: イニシャル表示） */
	showIcon?: boolean;
	/** カスタムアイコン名 */
	iconName?: string;
	/** グラデーション背景を使用 */
	useGradient?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	src: null,
	alt: "Avatar",
	name: "",
	size: "md",
	shape: "circle",
	class: "",
	editable: false,
	ring: false,
	ringColor: "ring-gray-300 dark:ring-gray-600",
	showIcon: false,
	iconName: "heroicons:user-circle",
	useGradient: false,
});

// Emits
type Emits = (e: "click") => void;

defineEmits<Emits>();

// State
const hasError = ref(false);

// Computed properties
const sizeClasses = {
	xs: "w-6 h-6",
	sm: "w-8 h-8",
	md: "w-10 h-10",
	lg: "w-12 h-12",
	xl: "w-16 h-16",
	"2xl": "w-20 h-20",
};

const textSizeClasses = {
	xs: "text-xs",
	sm: "text-sm",
	md: "text-base",
	lg: "text-lg",
	xl: "text-xl",
	"2xl": "text-2xl",
};

const iconSizeClasses = {
	xs: "w-4 h-4",
	sm: "w-6 h-6",
	md: "w-8 h-8",
	lg: "w-10 h-10",
	xl: "w-12 h-12",
	"2xl": "w-16 h-16",
};

const overlayIconSizeClasses = {
	xs: "w-3 h-3",
	sm: "w-4 h-4",
	md: "w-5 h-5",
	lg: "w-6 h-6",
	xl: "w-7 h-7",
	"2xl": "w-8 h-8",
};

const containerClasses = computed(() => [
	"relative inline-block",
	sizeClasses[props.size],
	props.class,
]);

const imageClasses = computed(() => [
	"w-full h-full object-cover",
	props.shape === "circle" ? "rounded-full" : "rounded-lg",
]);

const textSizeClass = computed(() => textSizeClasses[props.size]);

const iconSizeClass = computed(() => iconSizeClasses[props.size]);

const overlayIconSizeClass = computed(() => overlayIconSizeClasses[props.size]);

const ringClass = computed(() => {
	return props.ring ? `ring-2 ${props.ringColor}` : "";
});

// アバター画像のURL処理
const processedSrc = computed(() => {
	if (!props.src) return null;

	// 既にフルURLの場合はそのまま返す
	if (props.src.startsWith("http")) return props.src;

	// avatars/ プレフィックスを削除してAPIのURLを構築
	const avatarPath = props.src.replace(/^avatars\//, "");
	return `/api/avatars/${avatarPath}`;
});

// イニシャル生成
const initials = computed(() => {
	if (!props.name) return "?";

	const words = props.name.split(" ").filter(Boolean);
	if (words.length >= 2 && words[0] && words[1]) {
		return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
	}

	if (words[0]) {
		return words[0].charAt(0).toUpperCase();
	}

	return "?";
});

// フォールバック時のクラス
const fallbackClasses = computed(() => {
	if (props.useGradient) {
		return "bg-gradient-to-br from-blue-500 to-purple-600 text-white";
	}

	if (props.showIcon) {
		return "bg-gray-300 dark:bg-gray-600 text-gray-400 dark:text-gray-500";
	}

	// カラーグラデーションを生成
	const colors = [
		"bg-red-500 text-white",
		"bg-orange-500 text-white",
		"bg-amber-500 text-white",
		"bg-yellow-500 text-white",
		"bg-lime-500 text-white",
		"bg-green-500 text-white",
		"bg-emerald-500 text-white",
		"bg-teal-500 text-white",
		"bg-cyan-500 text-white",
		"bg-sky-500 text-white",
		"bg-blue-500 text-white",
		"bg-indigo-500 text-white",
		"bg-violet-500 text-white",
		"bg-purple-500 text-white",
		"bg-fuchsia-500 text-white",
		"bg-pink-500 text-white",
		"bg-rose-500 text-white",
	];

	const hash = props.name.split("").reduce((acc, char) => {
		return acc + char.charCodeAt(0);
	}, 0);

	return colors[hash % colors.length];
});

// 画像読み込みエラー時の処理
const handleImageError = () => {
	hasError.value = true;
};
</script>