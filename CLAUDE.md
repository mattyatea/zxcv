# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

## プロジェクト概要

**zxcv** は、AIコーディングルールを管理・共有するためのフルスタックアプリケーションです。Cloudflare Workers統合を備えたNuxt.jsアプリケーションで、チーム内でコーディングルールを共有・管理するためのプラットフォームを提供します。

**重要**: ここでいう「ルール」とは、AIに指示するためのプロンプトやコーディング指示のことを指します（Prettierなどのフォーマッターのルールではありません）。

使用技術:
- **フロントエンド**: Nuxt 3 with Vue 3, Tailwind CSS, Pinia（状態管理）
- **バックエンド**: oRPC（OpenAPIベースのRPCフレームワーク）on Cloudflare Workers
- **データベース**: SQLite via Cloudflare D1 with Prisma ORM
- **開発ツール**: Biome（リンティング/フォーマット）、Vitest（テスト）
- **ターゲット市場**: 主に日本、i18nサポート予定
- **ストレージ**: Cloudflare R2（ルールコンテンツ用Markdownファイル）、D1（メタデータ用）

## コア機能と要件

1. **ルールの公開レベル**:
   - Public: 全員がアクセス可能
   - Private: 作成者のみアクセス可能
   - Team: チームメンバーがアクセス可能

2. **バージョン管理**: すべてのルールは変更履歴付きでバージョン管理をサポート

3. **検索機能**: ルールとメタデータ全体の全文検索

4. **レート制限**:
   - プル操作に適用
   - 認証済みユーザーと匿名ユーザーで異なる制限
   - D1のrate_limitsテーブルを使用して実装

5. **ルールアクセスパターン**:
   - `/rules/rulename` - ダイレクトルールアクセス
   - `/rules/@org/rulename` - 組織スコープのルール
   - 匿名ユーザーはパブリックルールをプル可能
   - 作成者のみがプッシュ、削除、公開が可能

6. **API設計**:
   - OpenAPI仕様のRESTful API
   - 保護されたエンドポイントのJWT認証
   - 適切なステータスコードを持つ一貫したエラーレスポンス

## 重要なドキュメント参照

機能実装時に**必ず読むべき**ドキュメントサイト:
- **oRPCドキュメント**: https://orpc.unnoq.com/ - API用の型安全なRPCフレームワーク（公式ドキュメント）
- **Nuxt 3ドキュメント**: https://nuxt.com/docs - フレームワークドキュメント
- **Piniaドキュメント**: https://pinia.vuejs.org/ - 状態管理ライブラリ
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Prisma with D1**: https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1

## よく使うコマンド

### 開発
```bash
# 依存関係のインストール（pnpm@10.12.1が必要）
pnpm install

# 開発サーバーの起動（マイグレーション実行後、Nuxtを起動）
pnpm dev

# Cloudflare Workersプレビューで開発実行
pnpm preview
```

### テスト
```bash
# すべてのテストを実行
pnpm test

# ウォッチモードでテストを実行
pnpm test:watch

# カバレッジ付きでテストを実行
pnpm test:coverage

# 特定のテストスイートを実行
pnpm test:unit
pnpm test:integration

# 単一のテストファイルを実行
pnpm vitest run tests/utils/crypto.test.ts
```

### コード品質
```bash
# コードのリント（Biome使用）
pnpm lint

# リントの問題を修正
pnpm lint:fix

# コードのフォーマット
pnpm format

# フォーマットのチェック
pnpm format:check

# すべてのチェックを実行（リント + フォーマット）
pnpm check

# すべての問題を修正（リント + フォーマット）
pnpm check:fix

# 型チェック
pnpm typecheck
```

### データベースとデプロイ
```bash
# Prismaクライアントの生成
pnpm prisma:generate

# ローカルにマイグレーションを適用
pnpm migrate:local

# 本番にマイグレーションを適用
pnpm migrate:prod

# 本番用にビルド
pnpm build

# Cloudflare Workersにデプロイ
pnpm deploy
```

## ファイル構造ガイドライン

### フロントエンドファイル構成
```
/components/
  /common/          # 共通コンポーネント (Button, Modal, etc.)
    Button.vue
    Modal.vue
    LoadingSpinner.vue
  /rules/           # ルール関連コンポーネント
    RuleCard.vue
    RuleEditor.vue
    RuleList.vue
  /auth/            # 認証関連コンポーネント
    LoginForm.vue
    RegisterForm.vue
  /layout/          # レイアウトコンポーネント
    Header.vue
    Footer.vue
    Sidebar.vue

/composables/       # Vue Composables
  useAuth.ts        # 認証関連のロジック
  useRules.ts       # ルール操作のロジック
  useToast.ts       # 通知表示のロジック

/stores/            # Pinia Stores
  auth.ts           # 認証状態管理
  rules.ts          # ルール状態管理
  ui.ts             # UI状態管理 (モーダル、ローディング等)

/utils/             # ユーティリティ関数
  validators.ts     # バリデーション関数
  formatters.ts     # データフォーマット関数
  constants.ts      # 定数定義
```

### バックエンドファイル構成
```
/server/
  /api/             # API エンドポイント (もし REST API を追加する場合)
  /orpc/            # oRPC 関連
    /procedures/    # ドメイン別プロシージャ
      auth.ts
      rules.ts
      teams.ts
      users.ts
    /middleware/    # ミドルウェア
      auth.ts
      rateLimit.ts
      validation.ts
  /services/        # ビジネスロジック
    RuleService.ts
    TeamService.ts
    NotificationService.ts
  /repositories/    # データアクセス層
    RuleRepository.ts
    UserRepository.ts
    TeamRepository.ts
  /utils/           # ユーティリティ
    /cloudflare/    # Cloudflare 特有のユーティリティ
      r2.ts
      d1.ts
```

### コンポーネント設計ガイドライン

1. **単一責任**: 各コンポーネントは単一の責任を持つ
2. **Propsインターフェース**: 必ずTypeScriptでpropsの型定義を行う
3. **Emitイベント**: カスタムイベントは型定義付きで定義
4. **Composition API**: Options APIではなくComposition APIを使用

```vue
<!-- 良い例: RuleCard.vue -->
<script setup lang="ts">
interface Props {
  rule: Rule
  showActions?: boolean
}

interface Emits {
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<Emits>()
</script>
```

## 詳細なコードルール

### 1. コードフォーマット（Biome設定）
- **インデント**: タブ（幅: 2）
- **行幅**: 最大100文字
- **クオート**: 文字列にはダブルクオート
- **セミコロン**: 常に必須
- **末尾カンマ**: 複数行構造では常に付ける
- **アロー関数の括弧**: 常に必須
- **括弧内スペース**: 有効

### 2. TypeScriptルール
- **Strictモード**: 有効
- **明示的なAnyの禁止**: 警告（避けるべき）
- **Non-Nullアサーションの禁止**: 警告（オプショナルチェーニングを使用）
- **型インポート**: 型のみのインポートには`import type`を使用
- **Constアサーション**: リテラル型には`as const`を使用
- **Enumイニシャライザ**: 必須

### 3. 命名規則
- **ファイル**: camelCaseまたはPascalCase
- **関数**: camelCase（サーバー）/ camelCaseまたはPascalCase（クライアント）
- **変数**: camelCase、PascalCase、またはCONSTANT_CASE
- **型/インターフェース**: PascalCase
- **オブジェクトプロパティ**: camelCase、PascalCase、CONSTANT_CASE、またはsnake_case（DBフィールド用）

### 4. Vue/Nuxt固有のルール
- **コンポーネントファイル**: コンポーネントファイルにPascalCaseを使用
- **単一ファイルコンポーネント**: `<script setup>`構文を使用
- **Props**: TypeScriptインターフェースで定義
- **Emits**: TypeScriptで定義
- **状態管理**: グローバル状態にはPiniaを使用

### 5. oRPC Implementation Patterns

**重要なルール**:
1. **Contract と Procedure の名前は必ず一致させる**: 
   - Contractで定義した名前と、Procedureで実装する名前は完全に一致させること
   - 例: `authContract.register` → `os.auth.register`
   
2. **Contract First アプローチ**:
   - 必ず先にContractを定義してから、Procedureを実装する
   - ContractはOpenAPI仕様を生成するための定義
   - Procedureは実際のビジネスロジックの実装

3. **ファイル構造**:
   ```
   /server/orpc/
     /contracts/       # API定義（OpenAPI仕様）
       index.ts       # すべてのcontractをまとめる
       auth.ts        # 認証関連のcontract
       rules.ts       # ルール関連のcontract
       users.ts       # ユーザー関連のcontract
     /procedures/      # 実装
       auth.ts        # 認証関連のprocedure実装
       rules.ts       # ルール関連のprocedure実装
       users.ts       # ユーザー関連のprocedure実装
     router.ts        # ルーターでcontractとprocedureを結合
     index.ts         # oRPCのコンテキスト定義
   ```

4. **Contract定義パターン**:
   ```typescript
   // contracts/auth.ts
   import { oc } from "@orpc/contract";
   import * as z from "zod";
   
   export const authContract = {
     register: oc
       .route({
         method: "POST",
         path: "/auth/register",
         description: "Register a new user account",
       })
       .input(
         z.object({
           username: UsernameSchema,
           email: EmailSchema,
           password: PasswordSchema,
         })
       )
       .output(
         z.object({
           success: z.boolean(),
           message: z.string(),
           user: UserSchema,
         })
       ),
   };
   ```

5. **Procedure実装パターン**:
   ```typescript
   // procedures/auth.ts
   import { os } from "~/server/orpc";
   
   // Contract名と完全に一致させる
   export const register = os.auth.register
     .use(dbProvider) // Middleware
     .handler(async ({ input, context }) => {
       // ビジネスロジックの実装
       // inputはcontractで定義した型が自動的に適用される
       const { username, email, password } = input;
       // ...
     });
   
   // 最後にすべてのprocedureをexport
   export const authProcedures = {
     register,
     login,
     // ... 他のprocedure
   };
   ```

6. **Router設定**:
   ```typescript
   // router.ts
   import { implement } from "@orpc/server";
   import { contract } from "~/server/orpc/contracts";
   import { authProcedures } from "~/server/orpc/procedures/auth";
   
   const baseOs = implement(contract);
   const os = baseOs.$context<Context>();
   
   export const router = os.router({
     auth: authProcedures,  // contractのキーと一致
     rules: rulesProcedures,
     // ...
   });
   ```

7. **Middleware使用パターン**:
   - `dbProvider`: データベースアクセスが必要な場合
   - `authProvider`: 認証が必要な場合
   - `combinedProvider`: 認証+データベースアクセスが必要な場合
   - カスタムレート制限: `registerRateLimit`, `authRateLimit`など

8. **エラーハンドリング**:
   ```typescript
   throw new ORPCError("CONFLICT", { 
     message: authErrors.userExists(locale) 
   });
   ```
   - HTTPステータスコードに対応するエラータイプを使用
   - i18n対応のエラーメッセージを返す

### 6. エラーハンドリング
- APIエラーには適切なHTTPステータスコードと共に`ORPCError`を使用
- サーバーサイドコードではコンテキストと共にエラーをログに記録
- UIではユーザーフレンドリーなメッセージでエラーを優雅に処理

### 7. セキュリティパターン
- JWTトークンはlocalStorageに保存（クライアントサイド）
- APIコールのBearerトークン認証
- cryptoユーティリティを使用したパスワードハッシュ
- アカウントにはメール検証が必須
- センシティブなエンドポイントにレート制限

### 8. データベースパターン
- すべてのデータベース操作にPrismaを使用
- タイムスタンプはUnixエポック（秒）
- JSONフィールドは文字列として保存
- 適切な場所でソフトデリート
- パフォーマンスのための適切なインデックス

### 9. i18nの考慮事項
- 日本語（ja）と英語（en）のサポート
- メールテンプレートはすでにロケールベースのコンテンツをサポート
- UIはi18nを念頭において設計するべき
- デフォルトロケール: 日本語（日本市場向け）

### 10. 状態管理（Pinia）
```typescript
// Store定義パターン
export const useAuthStore = defineStore('auth', () => {
  // 状態
  const user = ref<User | null>(null)
  
  // ゲッター
  const isAuthenticated = computed(() => !!user.value)
  
  // アクション
  async function login(credentials: LoginCredentials) {
    // $rpcを使用した実装
  }
  
  return { user, isAuthenticated, login }
})
```

### 11. インポート順序の規則
```typescript
// 1. Node.js組み込み
import { readFile } from 'node:fs'

// 2. 外部依存関係
import { defineStore } from 'pinia'
import { z } from 'zod'

// 3. 内部エイリアス (~/)
import type { User } from '~/server/types/models'
import { useAuth } from '~/composables/useAuth'

// 4. 相対インポート
import { formatDate } from '../utils/formatters'
import Button from './Button.vue'
```

### 12. エラーメッセージとユーザーフィードバック
- エラーメッセージは日本語と英語の両方を用意
- ユーザー向けメッセージは親切で具体的に
- 技術的なエラーはログに記録し、ユーザーには一般的なメッセージを表示

```typescript
// 良い例
try {
  await saveRule(data)
  showToast({ 
    message: locale === 'ja' ? 'ルールを保存しました' : 'Rule saved successfully',
    type: 'success' 
  })
} catch (error) {
  console.error('Rule save error:', error)
  showToast({ 
    message: locale === 'ja' 
      ? 'ルールの保存に失敗しました。もう一度お試しください。' 
      : 'Failed to save rule. Please try again.',
    type: 'error' 
  })
}
```

### 13. APIレスポンスフォーマット
```typescript
// 成功レスポンス
interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

// エラーレスポンス
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}
```

### 14. テストガイドライン
- **新機能・追加機能の開発時**: 機能を実装したら必ずテストを作成し、**全てのテストがPASSすることを確認**してからコミットすること
- **リファクタリング実行時**: 既存のテストが全て通ることを確認し、必要に応じてテストも更新すること
- **テストの作成ルール**:
  - 各機能に対してユニットテストを作成
  - E2Eテストは主要なユーザーフローをカバー
  - テストファイルは対象ファイルと同じディレクトリに `.test.ts` 拡張子で配置
  - テストが失敗する場合は、必ず修正してからコミットすること

```typescript
// rules.test.ts
describe('RuleService', () => {
  it('should create a new rule', async () => {
    // Arrange
    const ruleData = { name: 'test-rule', content: '# Test' }
    
    // Act
    const result = await createRule(ruleData)
    
    // Assert
    expect(result.success).toBe(true)
    expect(result.data.name).toBe('test-rule')
  })
})
```

### 15. Gitコミットメッセージ規約

日本語でわかりやすくコミットメッセージを書く。**1つの作業の区切りなど、意味のあるタイミングで必ずコミットすること。**

```
<Type>: <概要>

<詳細（必要な場合）>
```

Types:
- `Enhance`: 機能改善・拡張
- `Feat`: 新機能追加
- `Fix`: バグ修正
- `Docs`: ドキュメント変更
- `Style`: コードスタイルの変更（機能に影響しない）
- `Refactor`: リファクタリング
- `Test`: テストの追加・修正
- `Chore`: ビルドプロセスやツールの変更

**重要**: 以下のタイミングでは**必ず**コミットを実行すること:
- 1つの機能が完成し、テストがPASSしたとき
- バグ修正が完了し、テストがPASSしたとき
- リファクタリングが一段落し、既存テストがPASSしたとき
- テストを追加・修正し、全テストがPASSしたとき
- **1回のタスクが完了したとき（作業の論理的な区切り）**
- **作業中でも、論理的な区切りがついたとき**

コミットメッセージの詳細部分には、具体的な変更内容を記述すること:

例:
```
Enhance: ルールのバージョン管理機能を改善

- バージョン履歴の表示を高速化
- 差分表示のUIを改善
- ロールバック時の確認ダイアログを追加
```

```
Fix: ログイン時のエラーハンドリングを修正

認証エラー時にトークンが残ってしまう問題を修正
```

```
Feat: チーム機能を実装

- チームの作成・編集・削除
- メンバーの招待機能
- 権限管理（オーナー、メンバー）
```

## アーキテクチャ概要

### フロントエンド構造
- **`/pages`**: ファイルベースルーティングを使用したNuxtページ
  - 認証ページ: `login.vue`, `register.vue`, `verify-email.vue`
  - ルール管理: `/rules/index.vue`, `/rules/new.vue`
- **`/layouts`**: Vueレイアウト（現在`default.vue`を使用）
- **`/assets/css`**: Tailwind CSSを使用したグローバルスタイル
- **`/plugins`**: oRPCクライアントセットアップを含むNuxtプラグイン
- **`/stores`**: 状態管理用Piniaストア（作成予定）
- **`/composables`**: 共有ロジック用Vue Composables
- **`/components`**: 再利用可能なVueコンポーネント

### バックエンドアーキテクチャ
- **`/server/orpc`**: oRPC API implementation
  - **`/contracts`**: OpenAPI契約定義 (必ずprocedureより先に定義)
    - `index.ts`: すべてのcontractをまとめる
    - `auth.ts`, `rules.ts`, etc.: ドメイン別のcontract定義
  - **`/procedures`**: API実装 (contractの名前と完全一致)
    - `auth.ts`, `rules.ts`, etc.: ドメイン別のprocedure実装
  - **`/middleware`**: Request middleware (auth, database, combined)
  - **`router.ts`**: ContractとProcedureを結合するルーター設定
  - **`index.ts`**: oRPCコンテキスト定義
- **`/server/utils`**: Utility functions for auth, crypto, email, JWT, logging, etc.
- **`/server/types`**: TypeScript type definitions
- **`/server/services`**: Business logic services
- **Database Models**: Defined in `/prisma/schema.prisma`
  - Core entities: User, Rule, Team, RuleVersion
  - Supporting tables: ApiKey, RateLimit, EmailVerification, etc.

### 主要な設計パターン
1. **API用oRPC**: OpenAPI生成付きの型安全なRPCフレームワーク
   - **Contract First**: 必ずContractを定義してからProcedureを実装
   - **名前の一致**: ContractとProcedureの名前は完全一致が必須
   - **型安全性**: Contractで定義した型がProcedureに自動適用
2. **ミドルウェアチェーン**: 認証+データベースアクセス用の統合ミドルウェア
3. **リポジトリパターン**: データアクセス抽象化のために計画中（`/server/repositories`参照）
4. **D1データベース**: Cloudflare上のSQLite用D1アダプタ付きPrismaを使用
5. **環境ベースの設定**: テスト/ステージング/本番用の異なるwrangler設定

### セキュリティの考慮事項
- 安全なトークンハンドリング付きJWTベース認証
- cryptoユーティリティを使用したパスワードハッシュ
- メール検証フロー
- スコープ付きAPIキー管理
- レート制限の実装
- Cloudflare WorkersでのCORS処理

## 開発メモ

- プロジェクトはインデントにタブを使用（Biomeで設定）
- TypeScript strictモードが有効
- node互換モード付きCloudflare Workers環境
- データベースマイグレーションは`/migrations`内のSQLファイル
- テスト環境は別のデータベース設定を使用
- メール送信はCloudflare Email Workersを使用
- コミット前に必ず`pnpm lint`と`pnpm typecheck`を実行
- **重要**: 型エラーがある場合は随時修正すること。特に以下に注意：
  - ORPCError の使用方法
  - Cloudflare bindings の型定義
  - 非同期関数の戻り値の型
  - null/undefined の適切な処理
- **oRPC開発時の注意**:
  - 新しいAPIを追加する際は、必ず先にContractを定義
  - ContractとProcedureの名前は完全一致させる（typoに注意）
  - Contractの変更時は、対応するProcedureも必ず更新

## 自動コード品質ツール

### Claude Codeフック
Claude Codeでファイルを編集すると、自動的にBiomeでフォーマットされます。`.claude/settings.json`で設定されています。

### Gitフック
コミット前に自動的にコード品質チェックが実行されます：
- **pre-commit**: lint-stagedが実行され、ステージングされたファイルに対して：
  - Biomeでのフォーマット（すべての`.ts`, `.tsx`, `.js`, `.jsx`, `.vue`ファイル）
  - TypeScriptの型チェック（`.ts`ファイルのみ）

これにより、コミットされるコードは常に一貫したフォーマットと型安全性が保証されます。

## ベストプラクティス

### 1. パフォーマンス最適化
- 重いコンポーネントには`lazy`インポートを使用
- 大量のリストには仮想スクロールを実装
- APIレスポンスを適切にキャッシュ
- Cloudflareのエッジキャッシング機能を使用

### 2. セキュリティベストプラクティス
- クライアントサイドコードに機密情報を公開しない
- クライアントとサーバーの両方ですべての入力を検証
- データベースクエリにプリペアドステートメントを使用（Prismaで処理）
- 適切なCORSポリシーを実装
- 依存関係の定期的なセキュリティ監査

### 3. アクセシビリティ（a11y）
- セマンティックHTML要素を使用
- 適切なARIAラベルを提供
- キーボードナビゲーションが機能することを確認
- スクリーンリーダーでテスト
- 適切な色コントラスト比を維持

### 4. コードレビューチェックリスト
- [ ] コードが確立されたパターンに従っている
- [ ] テストが作成され、パスしている
- [ ] 必要に応じてドキュメントが更新されている
- [ ] 本番コードにconsole.log文がない
- [ ] エラーハンドリングが実装されている
- [ ] 新しいテキストにi18nキーが追加されている
- [ ] パフォーマンスへの影響が考慮されている
- [ ] セキュリティへの影響がレビューされている

## Linearを使用したタスク管理

**重要**: このプロジェクトはLinearでタスク管理を行います。以下のルールに従ってください：

1. **プロジェクト名**: Linearで「zxcv」プロジェクトでタスクを管理
2. **作業開始前**: 作業を始める前に必ずLinearでタスクが存在するか確認
3. **タスク作成**: 新しい作業を割り当てられたら、Linearに存在するか確認し、なければ新規タスクを作成
4. **タスク命名規則**:
   - 実装タスクには`[Task]`プレフィックスを使用
   - 設計に関する質問や議論が必要な課題には`[QA]`プレフィックスを使用
5. **ステータス更新**: 以下の場合は必ずLinearタスクのステータスを更新:
   - タスクの作業を開始するとき（"In Progress"に移動）
   - タスクを完了したとき（"Done"に移動）
   - 依存関係でブロックされたとき（"Blocked"に移動）
6. **タスクフォーマット**: Linearタスクには以下を含める:
   - # 概要（概要セクション）
   - # やりたいこと（達成したいことセクション）- チェックリスト項目付き
   - # もし必要なら必要なパッケージ（必要な場合のパッケージ）