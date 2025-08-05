#!/usr/bin/env bun
import { chmodSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { $ } from "bun";

// Bunがサポートしているターゲット
// 参考: https://developer.mamezou-tech.com/blogs/2024/05/20/bun-cross-compile/
const platforms = [
	{
		target: "bun-windows-x64-modern",
		output: "zxcv-win-x64.exe",
		os: "Windows x64",
	},
	{ target: "bun-linux-x64-modern", output: "zxcv-linux-x64", os: "Linux x64" },
	{ target: "bun-linux-arm64", output: "zxcv-linux-arm64", os: "Linux ARM64" },
	{
		target: "bun-darwin-x64",
		output: "zxcv-macos-x64",
		os: "macOS x64 (Intel)",
	},
	{
		target: "bun-darwin-arm64",
		output: "zxcv-macos-arm64",
		os: "macOS ARM64 (Apple Silicon)",
	},
];

const distDir = resolve(import.meta.dir, "..", "dist");
const releaseDir = resolve(import.meta.dir, "..", "release");

// Create directories if they don't exist
if (!existsSync(releaseDir)) {
	mkdirSync(releaseDir, { recursive: true });
}

console.log("🚀 Building zxcv CLI for multiple platforms...");
console.log("Source: src/index.ts");
console.log(`Output directory: ${releaseDir}\n`);

const successfulBuilds: string[] = [];
const failedBuilds: string[] = [];

for (const platform of platforms) {
	console.log(`📦 Building for ${platform.os}...`);

	try {
		// Bunのコンパイルコマンド
		// --compile: スタンドアロン実行可能ファイルを生成
		// --target: ターゲットプラットフォーム
		// --outfile: 出力ファイル名
		await $`bun build src/index.ts --compile --minify --sourcemap --target=${platform.target} --outfile=${releaseDir}/${platform.output}`;

		// Set appropriate permissions
		const outputPath = resolve(releaseDir, platform.output);
		if (platform.output.endsWith(".exe")) {
			// Windows executables need read permissions
			chmodSync(outputPath, 0o644);
			console.log("  📝 Set permissions 644 for Windows executable");
		} else {
			// Unix executables need execute permissions
			chmodSync(outputPath, 0o755);
			console.log("  📝 Set permissions 755 for Unix executable");
		}

		console.log(`✅ Successfully built: ${platform.output}`);
		successfulBuilds.push(`${platform.os}: ${platform.output}`);
	} catch (error) {
		console.error(`❌ Failed to build for ${platform.os}:`, error);
		failedBuilds.push(`${platform.os}: ${error}`);
	}
}

console.log("\n📊 Build Summary:");
console.log("================");

if (successfulBuilds.length > 0) {
	console.log("\n✅ Successful builds:");
	for (const build of successfulBuilds) {
		console.log(`  - ${build}`);
	}
}

if (failedBuilds.length > 0) {
	console.log("\n❌ Failed builds:");
	for (const build of failedBuilds) {
		console.log(`  - ${build}`);
	}
}

if (failedBuilds.length === 0) {
	console.log("\n🎉 All builds completed successfully!");

	// List all build artifacts with file sizes
	console.log(`\n📁 Build artifacts in ${releaseDir}:`);
	const files = await $`ls -lh ${releaseDir}`.text();
	console.log(files);
} else {
	console.error("\n⚠️  Some builds failed. Please check the errors above.");
	process.exit(1);
}
