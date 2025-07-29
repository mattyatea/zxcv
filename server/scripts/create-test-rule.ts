import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

async function createTestRule() {
	const db = new PrismaClient();

	try {
		// テスト用ユーザーを取得または作成
		let user = await db.user.findFirst({
			where: { email: "test@example.com" },
		});

		if (!user) {
			user = await db.user.create({
				data: {
					id: nanoid(),
					email: "test@example.com",
					username: "testuser",
					passwordHash: "dummy", // 実際にはハッシュ化されたパスワード
					emailVerified: true,
					createdAt: Math.floor(Date.now() / 1000),
					updatedAt: Math.floor(Date.now() / 1000),
				},
			});
			console.log("テストユーザーを作成しました:", user.id);
		} else {
			console.log("既存のテストユーザーを使用:", user.id);
		}

		// テスト用ルールを作成
		const ruleId = nanoid();
		const rule = await db.rule.create({
			data: {
				id: ruleId,
				name: "test-public-rule",
				userId: user.id,
				description: "これはテスト用のパブリックルールです",
				visibility: "public",
				tags: JSON.stringify(["test", "public"]),
				publishedAt: Math.floor(Date.now() / 1000),
				downloads: 0,
				stars: 0,
				version: "1.0.0",
				latestVersionId: nanoid(),
				createdAt: Math.floor(Date.now() / 1000),
				updatedAt: Math.floor(Date.now() / 1000),
			},
		});

		console.log("テストルールを作成しました:");
		console.log("- ID:", rule.id);
		console.log("- Name:", rule.name);
		console.log("- Visibility:", rule.visibility);
		console.log("- User ID:", rule.userId);

		// データベース内のすべてのルールを確認
		const allRules = await db.rule.findMany({
			include: { user: true },
		});

		console.log("\nデータベース内のすべてのルール:");
		for (const r of allRules) {
			console.log(`- ${r.name} (${r.visibility}) by ${r.user?.username || "unknown"}`);
		}

		// 公開ルールのみを確認
		const publicRules = await db.rule.findMany({
			where: { visibility: "public" },
			include: { user: true },
		});

		console.log("\n公開ルールの数:", publicRules.length);
	} catch (error) {
		console.error("エラー:", error);
	} finally {
		await db.$disconnect();
	}
}

createTestRule();
