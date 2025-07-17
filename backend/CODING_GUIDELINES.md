# コーディングガイドライン

## 1. TypeScript コーディング規約

### 1.1 命名規則

#### 変数・関数
- **camelCase** を使用
- 動詞で始める（関数の場合）
- 具体的で説明的な名前を付ける

```typescript
// ✅ Good
const userEmail = "user@example.com";
const getUserById = (id: string) => { /* ... */ };
const isAuthenticated = true;

// ❌ Bad
const e = "user@example.com";
const get = (id: string) => { /* ... */ };
const flag = true;
```

#### クラス・インターフェース
- **PascalCase** を使用
- インターフェースには `I` プレフィックスを付けない
- 型エイリアスには `Type` サフィックスを付ける

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
}

class UserService {
  // ...
}

type UserCreateType = Omit<User, 'id'>;

// ❌ Bad
interface IUser {
  id: string;
  email: string;
}

class userService {
  // ...
}
```

#### 定数
- **SCREAMING_SNAKE_CASE** を使用
- モジュールレベルで定義

```typescript
// ✅ Good
const API_BASE_URL = "https://api.example.com";
const MAX_RETRY_COUNT = 3;

// ❌ Bad
const apiBaseUrl = "https://api.example.com";
const maxRetryCount = 3;
```

### 1.2 型定義のルール

#### 型の明示
- 関数の戻り値は明示的に型を指定
- 複雑な型は型エイリアスを使用

```typescript
// ✅ Good
function createUser(userData: UserCreateType): Promise<User> {
  // ...
}

type ApiResponse<T> = {
  data: T;
  success: boolean;
  error?: string;
};

// ❌ Bad
function createUser(userData: any) {
  // ...
}
```

#### Utility Types の活用
- `Pick`, `Omit`, `Partial`, `Required` を積極的に使用

```typescript
// ✅ Good
type UserUpdateType = Partial<Pick<User, 'email' | 'username'>>;
type UserResponseType = Omit<User, 'password'>;

// ❌ Bad
type UserUpdateType = {
  email?: string;
  username?: string;
};
```

### 1.3 エラーハンドリング

#### 統一されたエラーレスポンス
- 独自のエラークラスを使用
- エラーメッセージは具体的に

```typescript
// ✅ Good
import { ApiException } from "chanfana";

if (!user) {
  throw new ApiException("User not found");
}

// Prismaエラーは専用ハンドラーを使用
try {
  // ... prisma operations
} catch (error) {
  const prismaError = handlePrismaError(error);
  return c.json({ error: prismaError.message }, prismaError.status);
}

// ❌ Bad
if (!user) {
  throw new Error("Error");
}
```

### 1.4 async/await の使用方針

#### async/await を優先
- Promise.then() よりも async/await を使用
- 並列処理には Promise.all() を使用

```typescript
// ✅ Good
async function getUserWithPosts(userId: string): Promise<UserWithPosts> {
  const [user, posts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.post.findMany({ where: { authorId: userId } })
  ]);
  
  return { user, posts };
}

// ❌ Bad
function getUserWithPosts(userId: string): Promise<UserWithPosts> {
  return prisma.user.findUnique({ where: { id: userId } })
    .then(user => {
      return prisma.post.findMany({ where: { authorId: userId } })
        .then(posts => ({ user, posts }));
    });
}
```

## 2. プロジェクト構造の規約

### 2.1 ディレクトリ構成

```
src/
├── endpoints/          # APIエンドポイント
│   ├── auth/          # 認証関連
│   └── rules/         # ルール管理
├── middleware/        # ミドルウェア
├── services/          # ビジネスロジック
├── utils/             # ユーティリティ関数
├── types/             # TypeScript型定義
└── index.ts           # エントリーポイント
```

### 2.2 ファイル命名規則

- **camelCase** を使用
- 機能を表す明確な名前
- 複数のファイルがある場合は、関連するファイルを同じディレクトリに配置

```
// ✅ Good
src/endpoints/auth/login.ts
src/endpoints/auth/register.ts
src/endpoints/rules/createRule.ts
src/endpoints/rules/getRule.ts

// ❌ Bad
src/endpoints/l.ts
src/endpoints/r.ts
src/endpoints/create.ts
```

### 2.3 インポート順序

1. Node.js/外部ライブラリ
2. 内部のutilsとhelpers
3. 型定義
4. 相対パスのインポート

```typescript
// ✅ Good
import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

import { createPrismaClient } from "../../utils/prisma";
import { handlePrismaError } from "../../utils/prismaErrors";

import type { Env } from "../../types/env";
import type { AuthContext } from "../../middleware/auth";

import { canViewTeamRule } from "./utils/teams";
```

## 3. APIデザインガイドライン

### 3.1 RESTful設計の原則

#### リソース指向のURL設計
```
GET    /rules           # ルール一覧取得
POST   /rules           # ルール作成
GET    /rules/:id       # 特定ルール取得
PUT    /rules/:id       # ルール更新
DELETE /rules/:id       # ルール削除

GET    /rules/:id/versions       # バージョン一覧
GET    /rules/:id/versions/:ver  # 特定バージョン取得
```

#### 適切な HTTP メソッドの使用
- `GET`: データの取得
- `POST`: データの作成
- `PUT`: データの更新（完全置換）
- `PATCH`: データの部分更新
- `DELETE`: データの削除

### 3.2 HTTPステータスコード

```typescript
// ✅ 成功レスポンス
200 OK        // 正常処理
201 Created   // リソース作成成功
204 No Content // 削除成功

// ✅ クライアントエラー
400 Bad Request      // 不正なリクエスト
401 Unauthorized     // 認証が必要
403 Forbidden        // 権限不足
404 Not Found        // リソースが見つからない
409 Conflict         // 競合状態
429 Too Many Requests // レート制限

// ✅ サーバーエラー
500 Internal Server Error // 内部エラー
```

### 3.3 レスポンス形式の統一

#### 成功レスポンス
```typescript
// 単一リソース
{
  "id": "rule-123",
  "name": "eslint-config",
  "org": "myorg",
  "visibility": "public",
  "version": "1.0.0",
  "content": "...",
  "author": {
    "id": "user-123",
    "username": "john"
  },
  "created_at": 1642694400,
  "updated_at": 1642694400
}

// リスト型レスポンス
{
  "results": [...],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

#### エラーレスポンス
```typescript
{
  "error": "Rule not found",
  "code": "RULE_NOT_FOUND",
  "timestamp": 1642694400
}
```

## 4. データベース設計規約

### 4.1 Cloudflare D1 の制限事項

#### トランザクション制限
- **Cloudflare D1はトランザクション（$transaction）をサポートしていません**
- 複数のデータベース操作を組み合わせる場合は、個別のクエリを順次実行する
- エラーが発生した場合は、手動でロールバック処理を実装する

```typescript
// ❌ Bad - D1ではサポートされない
const result = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.profile.create({ data: profileData })
]);

// ✅ Good - 個別のクエリを順次実行
const user = await prisma.user.create({ data: userData });
try {
  const profile = await prisma.profile.create({ 
    data: { ...profileData, userId: user.id } 
  });
  return { user, profile };
} catch (error) {
  // 手動でロールバック
  await prisma.user.delete({ where: { id: user.id } });
  throw error;
}
```

#### バッチ処理の代替手段
- `createMany`、`updateMany`、`deleteMany` を活用
- 複数レコードの一括操作時は、可能な限りバッチ処理を使用

```typescript
// ✅ Good - バッチ処理を使用
await prisma.ruleVersion.createMany({
  data: versions.map(v => ({
    ruleId: rule.id,
    versionNumber: v.version,
    contentHash: v.hash
  }))
});
```

### 4.2 テーブル・カラム命名規則

#### テーブル名
- **snake_case** を使用
- 複数形を使用

```sql
-- ✅ Good
users
rules
rule_versions
team_members

-- ❌ Bad
User
rule
RuleVersion
```

#### カラム名
- **snake_case** を使用
- 明確で説明的な名前

```sql
-- ✅ Good
created_at
updated_at
user_id
latest_version_id

-- ❌ Bad
createdAt
updatedAt
uid
latestVerId
```

### 4.2 インデックス設計

#### パフォーマンスを考慮したインデックス
```sql
-- 検索でよく使用されるカラム
CREATE INDEX idx_rules_name ON rules(name);
CREATE INDEX idx_rules_org ON rules(org);
CREATE INDEX idx_rules_visibility ON rules(visibility);

-- 複合インデックス（検索条件の組み合わせ）
CREATE INDEX idx_rules_org_name ON rules(org, name);
CREATE INDEX idx_rules_visibility_updated ON rules(visibility, updated_at);
```

### 4.3 正規化とパフォーマンス

#### 適切な正規化レベル
- 基本的に第3正規形まで正規化
- パフォーマンスが必要な場合は非正規化も検討
- JSONカラムの適切な使用（tags、設定データなど）

```sql
-- ✅ 正規化されたテーブル設計
CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  org TEXT,
  user_id TEXT NOT NULL,
  visibility TEXT NOT NULL,
  tags TEXT, -- JSON形式で保存
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE rule_versions (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  version_number TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  FOREIGN KEY (rule_id) REFERENCES rules(id)
);
```

## 5. セキュリティガイドライン

### 5.1 認証・認可

#### JWT認証の実装
```typescript
// ✅ 適切な認証チェック
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");
  if (!user) {
    throw new ApiException("Authentication required");
  }
  await next();
};

// ✅ 権限チェック
if (rule.visibility === "private" && user.id !== rule.userId) {
  return c.json({ error: "Unauthorized" }, 401);
}
```

### 5.2 入力値検証

#### Zodによる厳密な検証
```typescript
// ✅ 適切な入力検証
const createRuleSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9-_]+$/),
  org: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional(),
  visibility: z.enum(["public", "private", "team"]),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).max(10).optional(),
  content: z.string().min(1).max(100000)
});
```

### 5.3 データ保護

#### 機密情報の取り扱い
```typescript
// ✅ パスワード等の機密情報は除外
const userResponse = {
  id: user.id,
  email: user.email,
  username: user.username,
  // password は含めない
};

// ✅ 環境変数での機密情報管理
const jwtSecret = env.JWT_SECRET;
```

## 6. TODOコメント管理

### 6.1 TODOコメントの原則

#### 必須：タスク管理システムと連携
- **TODOコメントを書く場合は、必ずLinearにタスクを作成する**
- TODOコメントにはLinearのタスクIDを記載する
- 実装の一部として残すTODOは禁止

```typescript
// ✅ Good - Linearタスクと連携
// TODO: MAT-65 - メール送信機能の実装
// Send email with reset link

// ❌ Bad - タスクなしのTODO
// TODO: Send email with reset link
```

#### TODOコメントの書式
```typescript
// TODO: [Linear Issue ID] - [簡潔な説明]
// [詳細な説明や注意点]
```

#### 例外的な場合
- 緊急時の一時的な実装の場合のみ、TODOコメントを残すことを許可
- ただし、**24時間以内**にLinearタスクを作成すること
- 緊急時TODOには期限を明記する

```typescript
// TODO: URGENT - 2025-07-17まで - 一時的なエラーハンドリング
// 正式なエラーハンドリングは別途実装予定
```

### 6.2 TODOコメントの定期チェック

#### 週次レビュー
- 毎週のコードレビューでTODOコメントの状況を確認
- 長期間残っているTODOは優先度を見直し

#### 自動チェック
- CIでTODOコメントの検出を行う
- Linear Issue IDが記載されていないTODOはビルドエラーとする

## 7. コミットメッセージ規約

### 7.1 Conventional Commits

#### フォーマット
```
<type>(<scope>): <description>

<body>

<footer>
```

#### Type
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: その他

#### 例
```
feat(auth): add JWT refresh token functionality

Implement refresh token rotation for enhanced security.
- Add refresh token generation
- Add token rotation logic
- Update authentication middleware

Closes #123
```

## 8. コードレビューガイドライン

### 8.1 レビューの観点

#### 機能性
- 要件を満たしているか
- エラーハンドリングは適切か
- パフォーマンスに問題はないか

#### 保守性
- コードは読みやすいか
- 適切な命名がされているか
- 重複はないか

#### セキュリティ
- 入力検証は適切か
- 認証・認可は正しく実装されているか
- 機密情報の漏洩はないか

### 8.2 承認条件

- 最低1名の承認が必要
- 自動テストが全て通過
- 型チェックが通過
- セキュリティチェックが通過

### 8.3 フィードバック方法

#### 建設的なフィードバック
```
// ✅ Good
「この部分でエラーハンドリングが必要ですね。handlePrismaErrorを使用してください」

// ❌ Bad
「エラーハンドリングが悪い」
```

#### 改善提案
```
// ✅ Good
「パフォーマンスを向上させるため、ここでPromise.allを使用してはいかがでしょうか？」

// ❌ Bad
「遅い」
```

---

## 9. 継続的改善

このガイドラインは定期的に見直し、プロジェクトの成長に合わせて更新していきます。

### 9.1 定期見直し
- 月1回のガイドライン見直し
- 新しい技術の導入時の更新
- チームフィードバックの反映

### 9.2 ツールによる自動化
- Biome設定での自動チェック
- Biome設定での自動フォーマット
- CI/CDでの自動検証
- TODOコメントの自動検出とLinearタスク連携チェック

このガイドラインに従うことで、チーム全体でのコード品質向上と開発効率の向上を目指します。