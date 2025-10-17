#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

const _distDir = resolve(import.meta.dir, "..", "dist");
const releaseDir = resolve(import.meta.dir, "..", "release");

// Read version from package.json
const packageJsonPath = resolve(import.meta.dir, "..", "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;

// Update version in src/index.ts
const indexPath = resolve(import.meta.dir, "..", "src", "index.ts");
let indexContent = readFileSync(indexPath, "utf-8");
const versionRegex = /const VERSION = "[\d.]+(-[a-zA-Z0-9.]+)?";/;
const newVersionLine = `const VERSION = "${version}";`;

if (versionRegex.test(indexContent)) {
	indexContent = indexContent.replace(versionRegex, newVersionLine);
	writeFileSync(indexPath, indexContent, "utf-8");
	console.log(`✅ Updated version in src/index.ts to ${version}`);
} else {
	console.warn("⚠️  Could not find VERSION constant in src/index.ts");
}

// Create directories if they don't exist
if (!existsSync(releaseDir)) {
	mkdirSync(releaseDir, { recursive: true });
}

console.log("🚀 Building zxcv CLI for multiple platforms...");
console.log(`Version: ${version}`);
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

		// Set appropriate permissions and calculate hash
		const outputPath = resolve(releaseDir, platform.output);

		// Calculate SHA256 hash
		const fileData = await Bun.file(outputPath).arrayBuffer();
		const hash = createHash("sha256")
			.update(new Uint8Array(fileData))
			.digest("hex");

		console.log(`✅ Successfully built: ${platform.output}`);
		console.log(`   SHA256: ${hash}`);
		successfulBuilds.push(
			`${platform.os}: ${platform.output} (SHA256: ${hash.slice(0, 8)}...)`,
		);
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

	// Generate SHA256 checksums file
	console.log("\n🔒 Generating SHA256 checksums...");
	let checksumContent = "# SHA256 Checksums for zxcv CLI builds\n\n";

	for (const platform of platforms) {
		const filePath = resolve(releaseDir, platform.output);
		if (existsSync(filePath)) {
			const fileData = await Bun.file(filePath).arrayBuffer();
			const hash = createHash("sha256")
				.update(new Uint8Array(fileData))
				.digest("hex");
			checksumContent += `${hash}  ${platform.output}\n`;
		}
	}

	// Write checksums to file
	const checksumPath = resolve(releaseDir, "checksums.sha256");
	await Bun.write(checksumPath, checksumContent);
	console.log("✅ SHA256 checksums saved to: checksums.sha256");
} else {
	console.error("\n⚠️  Some builds failed. Please check the errors above.");
	process.exit(1);
}
