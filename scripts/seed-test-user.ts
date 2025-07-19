import { hashPassword } from "../server/utils/crypto";
import { createPrismaClient } from "../server/utils/prisma";
import { D1Database } from "@cloudflare/workers-types";

// ローカル開発用のテストユーザーを作成
async function seedTestUser() {
  // これはローカル開発環境でのみ実行する想定
  const env = {
    DB: {} as D1Database // 実際のD1インスタンスが必要
  };

  const prisma = createPrismaClient(env.DB);

  try {
    // 既存のテストユーザーを確認
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" }
    });

    if (existingUser) {
      console.log("Test user already exists");
      return;
    }

    // テストユーザーを作成
    const hashedPassword = await hashPassword("password123");
    const { generateId } = await import("../server/utils/crypto");
    const user = await prisma.user.create({
      data: {
        id: generateId(),
        username: "testuser",
        email: "test@example.com",
        passwordHash: hashedPassword,
        emailVerified: true
      }
    });

    console.log("Test user created:", user);
  } catch (error) {
    console.error("Error seeding test user:", error);
  }
}

// 注意: このスクリプトは適切なD1環境で実行する必要があります
console.log("Please run this script in a proper D1 environment");