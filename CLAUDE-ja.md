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

## コマンドリファレンス

### 🚀 開発環境の起動
```bash
# 依存関係のインストール（pnpm@10.12.1が必要）
pnpm install

# 開発サーバーの起動（マイグレーション実行後、Nuxtを起動）
pnpm dev

# Cloudflare Workersプレビューで開発実行（本番環境に近い状態でテスト）
pnpm preview

# 特定のポートで起動
pnpm dev --port 3001
```

### 🧪 テスト実行
```bash
# すべてのテストを実行
pnpm test

# ウォッチモードでテストを実行（ファイル変更時に自動再実行）
pnpm test:watch

# カバレッジ付きでテストを実行
pnpm test:coverage

# 特定のテストスイートを実行
pnpm test:unit         # ユニットテストのみ
pnpm test:integration  # 統合テストのみ

# 単一のテストファイルを実行
pnpm vitest run tests/utils/crypto.test.ts

# 特定のテストだけを実行（名前でフィルタ）
pnpm vitest -t "should create user"
```

### 🔧 コード品質管理
```bash
# コードのリント（Biome使用）
pnpm lint

# リントの問題を自動修正
pnpm lint:fix

# コードのフォーマット
pnpm format

# フォーマットのチェック（CIで使用）
pnpm format:check

# すべてのチェックを実行（リント + フォーマット）
pnpm check

# すべての問題を自動修正（リント + フォーマット）
pnpm check:fix

# TypeScriptの型チェック
pnpm typecheck

# 型チェック（ウォッチモード）
pnpm typecheck:watch
```

### 🗄️ データベース操作
```bash
# Prismaクライアントの生成（型定義を更新）
pnpm prisma:generate

# ローカルにマイグレーションを適用
pnpm migrate:local

# 本番にマイグレーションを適用
pnpm migrate:prod

# 新しいマイグレーションを作成
pnpm prisma migrate dev --name add_new_field

# データベースをリセット（開発環境のみ）
pnpm prisma migrate reset

# Prisma Studioを起動（データベースのGUI）
pnpm prisma studio
```

### 📦 ビルドとデプロイ
```bash
# 本番用にビルド
pnpm build

# ビルドサイズの分析
pnpm analyze

# Cloudflare Workersにデプロイ
pnpm deploy

# 特定の環境にデプロイ
pnpm deploy:staging    # ステージング環境
pnpm deploy:production # 本番環境

# デプロイ前のドライラン
pnpm wrangler deploy --dry-run
```

### 🛠️ その他の便利なコマンド
```bash
# 依存関係の更新チェック
pnpm outdated

# 依存関係を最新版に更新
pnpm update

# キャッシュのクリア
pnpm store prune

# プロジェクトのクリーンアップ
rm -rf node_modules .nuxt .output
pnpm install

# 環境変数の確認
pnpm wrangler secret list

# ログの確認（Cloudflare Workers）
pnpm wrangler tail

# APIドキュメントの生成
pnpm generate:api-docs
```

### 💡 開発Tips
```bash
# Nuxtの開発ツールを有効化
pnpm dev --devtools

# HTTPSで開発サーバーを起動
pnpm dev --https

# ネットワーク上の他のデバイスからアクセス可能にする
pnpm dev --host

# ビルド時間の計測
time pnpm build

# 特定のブランチからインストール
pnpm install some-package@github:user/repo#branch
```

## ファイル構造ガイドライン

### フロントエンドファイル構成（app/ディレクトリ配下）
```
/app/
  app.vue             # メインアプリケーションコンポーネント
  /assets/
    /css/             # グローバルスタイル
      animations.css
      main.css
      patterns.css
      transitions.css
  
  /components/
    /common/          # 共通コンポーネント
      Badge.vue
      Button.vue
      Card.vue
      Input.vue
      LanguageSwitcher.vue
      LoadingOverlay.vue
      LoadingSpinner.vue
      Modal.vue
      Select.vue
      TagInput.vue
      Textarea.vue
      Toast.vue
    /layout/          # レイアウトコンポーネント
      Header.vue
      Footer.vue
    /organizations/   # 組織関連コンポーネント
      InviteMemberModal.vue

  /composables/       # Vue Composables
    useAnimation.ts   # アニメーション関連のロジック
    useDebug.ts       # デバッグ用ユーティリティ
    useI18n.ts        # 国際化ロジック
    useToast.ts       # 通知表示のロジック

  /stores/            # Pinia Stores
    auth.ts           # 認証状態管理
    i18n.ts           # 言語設定管理
    settings.ts       # アプリ設定管理
    theme.ts          # テーマ管理
    toast.ts          # トースト通知管理

  /utils/             # ユーティリティ関数
    debounce.ts       # デバウンス処理
    debug.ts          # デバッグユーティリティ
  
  /i18n/
    /locales/         # 言語ファイル
      en.json
      ja.json
  
  /layouts/           # Nuxtレイアウト
    auth.vue          # 認証画面用レイアウト
    default.vue       # デフォルトレイアウト
  
  /middleware/        # Nuxtミドルウェア
    auth.ts           # 認証チェック
    authRedirect.global.ts # グローバル認証リダイレクト
  
  /pages/             # Nuxtページ（ファイルベースルーティング）
    index.vue         # ホームページ
    login.vue         # ログインページ
    register.vue      # 登録ページ
    /auth/            # 認証関連ページ
      /callback/
        [provider].vue # OAuth コールバック
      setup-username.vue
    /organizations/   # 組織関連ページ
      index.vue       # 組織一覧
      new.vue         # 新規組織作成
      [id].vue        # 組織詳細
      join.vue        # 組織参加
    /rules/           # ルール関連ページ
      index.vue       # ルール一覧
      new.vue         # 新規ルール作成
      /@[owner]/      # スコープ付きルール
        /[name]/
          index.vue   # ルール詳細
          edit.vue    # ルール編集
    /user/            # ユーザー関連ページ
      [username].vue  # ユーザープロフィール
    /profile/
      [username].vue  # プロフィール表示
    /org/
      [orgname].vue   # 組織プロフィール
  
  /plugins/           # Nuxtプラグイン
    authCheck.client.ts    # クライアントサイド認証チェック
    i18n.client.ts         # クライアントサイドi18n
    i18n.server.ts         # サーバーサイドi18n
    i18nInit.client.ts     # i18n初期化
    orpc.ts                # oRPCクライアント設定
    theme.client.ts        # テーマ設定
```

### バックエンドファイル構成（server/ディレクトリ配下）
```
/server/
  /orpc/              # oRPC 関連
    index.ts          # oRPCコンテキスト定義
    router.ts         # ルーター設定
    types.ts          # 型定義
    /contracts/       # API契約定義（OpenAPI仕様）
      index.ts        # 全contractの統合
      auth.ts         # 認証関連contract
      health.ts       # ヘルスチェックcontract
      organizations.ts # 組織関連contract
      rules.ts        # ルール関連contract
      users.ts        # ユーザー関連contract
    /procedures/      # API実装
      auth.ts         # 認証関連procedure
      health.ts       # ヘルスチェックprocedure
      organizations.ts # 組織関連procedure
      rules.ts        # ルール関連procedure
      users.ts        # ユーザー関連procedure
    /middleware/      # ミドルウェア
      auth.ts         # 認証ミドルウェア
      combined.ts     # 統合ミドルウェア（認証+DB）
      db.ts           # データベースミドルウェア
      rateLimit.ts    # レート制限ミドルウェア
    /schemas/         # Zodスキーマ定義
      common.ts       # 共通スキーマ
  
  /services/          # ビジネスロジック層
    index.ts          # サービスのエクスポート
    AuthService.ts    # 認証サービス
    OrganizationService.ts # 組織管理サービス
    RuleService.ts    # ルール管理サービス
    EmailVerificationService.ts # メール認証サービス
  
  /repositories/      # データアクセス層
    index.ts          # リポジトリのエクスポート
    BaseRepository.ts # ベースリポジトリ
    OrganizationRepository.ts # 組織リポジトリ
    RuleRepository.ts # ルールリポジトリ
    UserRepository.ts # ユーザーリポジトリ
  
  /routes/            # HTTPルート定義
    api-docs.ts       # APIドキュメント
    api-spec.json.ts  # OpenAPI仕様エンドポイント
    /api/             # REST APIルート
      index.ts
      [...].ts        # キャッチオールルート
      /auth/
        /callback/
          [provider].ts # OAuth コールバック
    /rpc/             # oRPCルート
      index.ts
      [...].ts        # oRPCハンドラー
  
  /utils/             # ユーティリティ関数
    auth.ts           # 認証ユーティリティ
    cache.ts          # キャッシュ管理
    crypto.ts         # 暗号化関連
    email.ts          # メール送信
    errorHandler.ts   # エラーハンドリング
    i18n.ts           # 国際化
    jwt.ts            # JWTトークン管理
    locale.ts         # ロケール処理
    logger.ts         # ロギング
    namespace.ts      # 名前空間管理
    oauth.ts          # OAuth処理
    oauthCleanup.ts   # OAuthクリーンアップ
    oauthSecurity.ts  # OAuthセキュリティ
    organizations.ts  # 組織関連ユーティリティ
    orpcHandler.ts    # oRPCハンドラー
    prisma.ts         # Prismaユーティリティ
    validation.ts     # バリデーション
  
  /types/             # TypeScript型定義
    bindings.ts       # Cloudflare bindings
    env.d.ts          # 環境変数型定義
    errors.ts         # エラー型定義
    models.ts         # データモデル型
  
  /plugins/           # Nitroプラグイン
    prisma.ts         # Prisma初期化
  
  tsconfig.json       # サーバー用TypeScript設定
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

4. **実際のContract定義例**:
   ```typescript
   // contracts/rules.ts
   import { oc } from "@orpc/contract";
   import * as z from "zod";
   
   export const rulesContract = {
     // パスによるルール取得
     getByPath: oc
       .route({
         method: "POST",
         path: "/rules/getByPath",
         description: "Get a rule by its path (@owner/rulename)",
       })
       .input(
         z.object({
           path: z.string().describe("Rule path in format @owner/rulename"),
         })
       )
       .output(
         z.object({
           id: z.string(),
           name: z.string(),
           userId: z.string().nullable(),
           visibility: z.string(),
           description: z.string().nullable(),
           tags: z.array(z.string()),
           // ... 他のフィールド
           user: z.object({
             id: z.string(),
             username: z.string(),
             email: z.string(),
           }),
           organization: z.object({
             id: z.string(),
             name: z.string(),
             displayName: z.string(),
           }).nullable(),
         })
       ),
       
     // ルール作成
     create: oc
       .route({
         method: "POST",
         path: "/rules/create",
         description: "Create a new rule",
       })
       .input(
         z.object({
           name: RuleNameSchema,
           description: z.string(),
           content: z.string(),
           visibility: z.enum(["public", "private", "team"]),
           tags: z.array(z.string()).optional(),
           organizationId: z.string().optional(),
         })
       )
       .output(
         z.object({
           id: z.string(),
         })
       ),
   };
   ```

5. **実際のProcedure実装例**:
   ```typescript
   // procedures/rules.ts
   import { ORPCError } from "@orpc/server";
   import { os } from "../index";
   import { dbWithAuth, dbWithOptionalAuth } from "../middleware/combined";
   import { RuleService } from "../../services/RuleService";
   
   export const rulesProcedures = {
     // Contract名と完全に一致させる
     getByPath: os.rules.getByPath
       .use(dbWithOptionalAuth) // 認証はオプショナル
       .handler(async ({ input, context }) => {
         const { db, user, env } = context;
         const ruleService = new RuleService(db, env.R2, env);
         
         // パスをパース
         const parsed = parseRulePath(input.path);
         if (!parsed) {
           throw new ORPCError("BAD_REQUEST", {
             message: "Invalid rule path format",
           });
         }
         
         const { owner, ruleName } = parsed;
         const result = await ruleService.getRule(ruleName, owner, user?.id);
         
         // Contractで定義したフォーマットで返す
         return {
           id: rule.id,
           name: rule.name,
           // ... 他のフィールド
         };
       }),
       
     create: os.rules.create
       .use(dbWithAuth) // 認証必須
       .handler(async ({ input, context }) => {
         const { db, user, env } = context;
         const ruleService = new RuleService(db, env.R2, env);
         
         const result = await ruleService.createRule(user.id, input);
         return { id: result.rule.id };
       }),
   };
   ```

6. **Context定義パターン**:
   ```typescript
   // index.ts
   import { createOS } from "@orpc/server";
   import type { PrismaClient } from "@prisma/client";
   
   export interface Context {
     db?: PrismaClient;
     user?: { id: string; email: string; };
     env: Env;
     cloudflare?: {
       request: Request;
       ctx: ExecutionContext;
     };
   }
   
   export const os = createOS<Context>();
   ```

7. **Middleware使用パターン**:
   ```typescript
   // middleware/combined.ts
   export const dbWithAuth = os.use(async ({ context, next }) => {
     // DBコネクションを確立
     const db = await getPrismaClient(context.env);
     
     // 認証チェック
     const user = await verifyAuth(context);
     if (!user) {
       throw new ORPCError("UNAUTHORIZED");
     }
     
     return next({
       context: { ...context, db, user },
     });
   });
   
   export const dbWithOptionalAuth = os.use(async ({ context, next }) => {
     const db = await getPrismaClient(context.env);
     const user = await verifyAuth(context); // nullの可能性あり
     
     return next({
       context: { ...context, db, user },
     });
   });
   ```
   - `dbWithAuth`: 認証+データベースアクセスが必要な場合
   - `dbWithOptionalAuth`: DBアクセス+オプショナル認証
   - `dbWithEmailVerification`: メール認証確認付き
   - カスタムレート制限: `registerRateLimit`, `authRateLimit`など

8. **エラーハンドリング**:
   ```typescript
   // 基本的なエラー
   throw new ORPCError("BAD_REQUEST", {
     message: "Invalid input",
   });
   
   // i18n対応エラー
   throw new ORPCError("CONFLICT", { 
     message: authErrors.userExists(locale) 
   });
   
   // カスタムエラーコード付き
   throw new ORPCError("FORBIDDEN", {
     message: "Insufficient permissions",
     code: "PERMISSION_DENIED",
   });
   ```
   - HTTPステータスコードに対応するエラータイプを使用
   - i18n対応のエラーメッセージを返す

9. **クライアントサイドの使用例**:
   ```typescript
   // plugins/orpc.ts
   import { createORPCNuxtClient } from "@orpc/nuxt/client";
   import type { Contract } from "~/server/orpc/contracts";
   
   export default defineNuxtPlugin(() => {
     const $rpc = createORPCNuxtClient<Contract>({
       endpoint: "/rpc",
     });
     
     return { provide: { $rpc } };
   });
   
   // コンポーネントでの使用
   const { $rpc } = useNuxtApp();
   
   // 型安全なAPIコール
   const rule = await $rpc.rules.getByPath({
     path: "@username/my-rule",
   });
   
   // エラーハンドリング
   try {
     await $rpc.rules.create({
       name: "new-rule",
       content: "# My Rule",
       visibility: "public",
     });
   } catch (error) {
     if (error.code === "UNAUTHORIZED") {
       // ログインページへリダイレクト
     }
   }
   ```

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

### フロントエンド構造（app/ディレクトリ）
- **`app.vue`**: メインアプリケーションコンポーネント
- **`/pages`**: ファイルベースルーティングを使用したNuxtページ
  - 認証ページ: `login.vue`, `register.vue`, `verifyEmail.vue`
  - ルール管理: `/rules/index.vue`, `/rules/new.vue`, `/rules/@[owner]/[name]/`
  - 組織管理: `/organizations/index.vue`, `/organizations/new.vue`
  - プロフィール: `/user/[username].vue`, `/profile/[username].vue`, `/org/[orgname].vue`
- **`/layouts`**: Vueレイアウト（`default.vue`, `auth.vue`）
- **`/assets/css`**: Tailwind CSSを使用したグローバルスタイル
- **`/plugins`**: Nuxtプラグイン（oRPCクライアント、i18n、テーマ管理等）
- **`/stores`**: 状態管理用Piniaストア（auth, i18n, settings, theme, toast）
- **`/composables`**: 共有ロジック用Vue Composables
- **`/components`**: 再利用可能なVueコンポーネント
- **`/middleware`**: Nuxtミドルウェア（認証チェック等）
- **`/i18n`**: 国際化ファイル（ja.json, en.json）

### バックエンドアーキテクチャ（server/ディレクトリ）
- **`/server/orpc`**: oRPC API 実装
  - **`/contracts`**: OpenAPI契約定義 (必ずprocedureより先に定義)
    - `index.ts`: すべてのcontractをまとめる
    - `auth.ts`, `rules.ts`, `organizations.ts`, `users.ts`, `health.ts`: ドメイン別contract
  - **`/procedures`**: API実装 (contractの名前と完全一致)
    - `auth.ts`, `rules.ts`, `organizations.ts`, `users.ts`, `health.ts`: ドメイン別procedure
  - **`/middleware`**: リクエストミドルウェア
    - `auth.ts`: 認証ミドルウェア
    - `db.ts`: データベースミドルウェア
    - `combined.ts`: 統合ミドルウェア（auth + db）
    - `rateLimit.ts`: レート制限ミドルウェア
  - **`/schemas`**: 共通Zodスキーマ
  - **`router.ts`**: ContractとProcedureを結合するルーター設定
  - **`index.ts`**: oRPCコンテキスト定義
- **`/server/services`**: ビジネスロジックサービス
  - `AuthService.ts`: 認証サービス
  - `OrganizationService.ts`: 組織管理サービス
  - `RuleService.ts`: ルール管理サービス
  - `EmailVerificationService.ts`: メール検証サービス
- **`/server/repositories`**: データアクセス層（リポジトリパターン）
  - `BaseRepository.ts`: ベースリポジトリ
  - `UserRepository.ts`, `RuleRepository.ts`, `OrganizationRepository.ts`: 各エンティティリポジトリ
- **`/server/routes`**: HTTPルート定義
  - `/api/`: REST APIルート（OAuthコールバック等）
  - `/rpc/`: oRPCルート
  - `api-spec.json.ts`: OpenAPI仕様エンドポイント
- **`/server/utils`**: ユーティリティ関数
  - 認証、暗号化、メール、JWT、ロギング、OAuth、i18n等
- **`/server/types`**: TypeScript型定義
  - `bindings.ts`: Cloudflare bindings
  - `env.d.ts`: 環境変数型
  - `errors.ts`: エラー型
  - `models.ts`: データモデル型
- **`/prisma/schema.prisma`**: データベーススキーマ
  - コアエンティティ: User, Rule, Team, RuleVersion
  - サポートテーブル: ApiKey, RateLimit, EmailVerification等

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

## Cloudflare Workers特有の注意点

### 環境変数とシークレット
```bash
# ローカル開発時は.dev.varsファイルを使用
# .dev.vars (gitignore済み)
JWT_SECRET=your-secret-key
DATABASE_URL=file:./local.db

# 本番環境はwrangler secretで設定
pnpm wrangler secret put JWT_SECRET
pnpm wrangler secret put EMAIL_API_KEY
```

### Cloudflare固有のAPI使用
```typescript
// R2 Storage（ルールコンテンツ保存用）
const object = await env.R2.put(key, content);
const data = await env.R2.get(key);

// D1 Database（Prismaアダプター経由）
const prisma = getPrismaClient(env);

// KV Storage（キャッシュ用）
await env.CACHE.put(key, value, { expirationTtl: 3600 });

// Durable Objects（将来の実装用）
// リアルタイムコラボレーション機能で使用予定
```

### Workers制限事項
1. **CPU時間制限**: 
   - 無料プラン: 10ms
   - 有料プラン: 50ms
   - 複雑な処理は分割またはバックグラウンド化

2. **メモリ制限**:
   - 128MB固定
   - 大きなファイルはストリーミング処理

3. **リクエストサイズ**:
   - 最大100MB
   - ルールコンテンツは圧縮を推奨

4. **同時実行数**:
   - 無料: 1000リクエスト/分
   - 有料: 無制限

### デプロイメントの注意点
```bash
# ビルドサイズの確認
pnpm wrangler deploy --dry-run

# 互換性フラグの設定（wrangler.toml）
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2024-01-01"

# 環境別デプロイ
pnpm wrangler deploy --env staging
pnpm wrangler deploy --env production
```

### Cloudflare特有のエラー処理
```typescript
// Workers固有のエラー
try {
  await env.R2.put(key, content);
} catch (error) {
  if (error.message.includes("R2_QUOTA_EXCEEDED")) {
    // ストレージ制限エラー
  }
}

// レート制限の実装
const rateLimiter = {
  check: async (ip: string) => {
    const key = `rate:${ip}`;
    const count = await env.RATE_LIMIT.get(key);
    if (count && parseInt(count) > 100) {
      throw new ORPCError("TOO_MANY_REQUESTS");
    }
    await env.RATE_LIMIT.put(key, "1", { 
      expirationTtl: 60 
    });
  }
};
```

### パフォーマンス最適化
1. **キャッシュ戦略**:
   ```typescript
   // Cloudflare CDNキャッシュ
   return new Response(body, {
     headers: {
       "Cache-Control": "public, max-age=3600",
       "CDN-Cache-Control": "max-age=86400",
     },
   });
   ```

2. **Subrequests最適化**:
   - 1リクエストあたり最大50サブリクエスト
   - バッチ処理を活用

3. **ストリーミングレスポンス**:
   ```typescript
   // 大きなデータのストリーミング
   return new Response(
     new ReadableStream({
       async start(controller) {
         // チャンクごとに処理
       },
     }),
   );
   ```

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
- **Cloudflare Workers開発時**:
  - CPU時間制限に注意（特に暗号化処理）
  - グローバル変数の使用は避ける（リクエスト間で共有される）
  - WebSocket実装時はDurable Objectsを検討

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

## トラブルシューティング

### よくある問題と解決方法

#### 🔴 開発サーバーが起動しない
```bash
# エラー: "Cannot find module"
pnpm install  # 依存関係を再インストール

# エラー: "Port 3000 is already in use"
lsof -i :3000  # ポートを使用しているプロセスを確認
kill -9 <PID>  # プロセスを終了
# または別のポートで起動
pnpm dev --port 3001

# エラー: "EACCES: permission denied"
sudo rm -rf node_modules .nuxt .output
pnpm install
```

#### 🔴 TypeScriptエラー
```bash
# Prismaの型定義が見つからない
pnpm prisma:generate

# 型定義の不整合
pnpm typecheck  # エラー詳細を確認
rm -rf .nuxt   # キャッシュクリア
pnpm dev

# VS Codeで型エラーが消えない
# Command + Shift + P → "TypeScript: Restart TS Server"
```

#### 🔴 データベースエラー
```bash
# "Table does not exist"
pnpm migrate:local  # マイグレーションを実行

# "SQLITE_BUSY: database is locked"
# 別のプロセスがDBを使用中。Prisma Studioなどを終了

# マイグレーションが失敗する
pnpm prisma migrate reset  # DBをリセット（開発環境のみ）
```

#### 🔴 Cloudflare Workers関連
```bash
# "wrangler not found"
pnpm install -g wrangler

# "Authentication required"
pnpm wrangler login

# デプロイエラー
pnpm wrangler deploy --dry-run  # ドライランで確認
pnpm wrangler tail  # ログを確認

# 環境変数が読み込まれない
pnpm wrangler secret put <KEY_NAME>
```

#### 🔴 認証関連のエラー
```javascript
// "JWT expired"
// → トークンの有効期限切れ。再ログインが必要

// "Invalid credentials"
// → メールアドレスまたはパスワードが間違っている

// "Email not verified"
// → メール認証が完了していない
```

#### 🔴 ビルドエラー
```bash
# メモリ不足エラー
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build

# ESMモジュールエラー
# package.jsonで "type": "module" を確認
# .js → .mjs または .cjs に変更

# Tailwind CSSが適用されない
# tailwind.config.jsのcontentパスを確認
```

### デバッグ方法

#### 📋 ログの確認方法
```bash
# 開発環境のログ
pnpm dev
# ブラウザのコンソールとターミナルの両方を確認

# Cloudflare Workersのログ
pnpm wrangler tail
# または Cloudflare ダッシュボードでリアルタイムログを確認

# 詳細なログを有効化
export DEBUG=*  # すべてのデバッグログを表示
pnpm dev
```

#### 🔍 エラーの調査手順
1. **エラーメッセージを読む**
   - スタックトレースから発生箇所を特定
   - エラーコードで検索

2. **ログを追加**
   ```typescript
   // サーバーサイド
   const logger = createLogger('debug');
   logger.info('処理開始', { input });
   
   // クライアントサイド
   console.log('State:', { user, isAuthenticated });
   ```

3. **ブレークポイントを設定**
   - VS Code: 行番号の左をクリック
   - Chrome DevTools: Sources タブでブレークポイント設定

4. **ネットワークタブを確認**
   - APIリクエスト/レスポンスを確認
   - ステータスコード、ヘッダー、ペイロードをチェック

#### 🛠️ 便利なデバッグツール
```bash
# Vue Devtools
# Chrome拡張機能をインストール
# コンポーネントの状態、Piniaストアを確認

# Prisma Studio
pnpm prisma studio
# データベースの内容をGUIで確認・編集

# APIテスト
curl http://localhost:3000/api/health
# またはPostman/Insomniaを使用
```

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