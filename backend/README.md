# zxcv - コーディングルール共有ツール

組織やチームでコーディングルール（ESLint設定など）を共有・管理できるプラットフォームのバックエンドAPI。

## 技術スタック

- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono
- **API仕様**: OpenAPI 3.1 (chanfana)
- **データベース**: Cloudflare D1 (SQLite)
- **ORM**: Prisma
- **ストレージ**: Cloudflare R2
- **認証**: JWT
- **バリデーション**: Zod
- **テスト**: Vitest

## プロジェクト構造

```
backend/
├── src/              # ソースコード
│   ├── handlers/     # APIハンドラー
│   ├── services/     # ビジネスロジック
│   ├── utils/        # ユーティリティ
│   └── types/        # 型定義
├── prisma/           # Prismaスキーマ・マイグレーション
├── tests/            # テストコード
└── wrangler.toml     # Cloudflare Workers設定
```

## セットアップ

1. 依存関係のインストール:
   ```bash
   pnpm install
   ```

2. D1データベースの作成:
   ```bash
   npx wrangler d1 create zxcv-db
   ```
   作成されたデータベースIDを `wrangler.toml` の `database_id` フィールドに設定

3. データベースマイグレーションの実行:
   ```bash
   pnpm migrate:local  # ローカル環境
   pnpm migrate:prod   # 本番環境
   ```

4. 開発サーバーの起動:
   ```bash
   pnpm dev
   ```

## 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# テスト実行
pnpm test
pnpm test:watch  # ウォッチモード

# リント・フォーマット
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check

# 型チェック
pnpm typecheck

# データベースマイグレーション
pnpm migrate:local  # ローカル環境
pnpm migrate:prod   # 本番環境

# OpenAPIスキーマ生成
pnpm schema

# デプロイ
npx wrangler deploy
```

## API設計

### エンドポイント構造

- `/auth/*` - 認証関連
- `/rules/*` - ルール管理
- `/rules/@:org/:rulename` - 組織ルール
- `/rules/:id/versions` - バージョン管理
- `/teams/*` - チーム管理
- `/search` - 検索機能

### 認証方式

- JWT Bearer Token
- リフレッシュトークン対応
- APIキー認証（将来実装）

## データベース設計

主要テーブル:
- `users` - ユーザー情報
- `rules` - ルール基本情報
- `rule_versions` - ルールのバージョン履歴
- `teams` - チーム情報
- `team_members` - チームメンバー
- `api_keys` - APIキー
- `rate_limits` - レート制限

## 開発ガイドライン

### 重要なドキュメント

開発を始める前に以下のドキュメントを必ず読んでください：

- **[CLAUDE.md](./CLAUDE.md)** - プロジェクトの詳細な開発ガイドライン、Linear連携ルール
- **[CODING_GUIDELINES.md](./CODING_GUIDELINES.md)** - コーディング規約、命名規則、設計方針

### コミット前チェックリスト

1. 型エラーがないことを確認:
   ```bash
   pnpm typecheck
   ```

2. リント・フォーマットチェック:
   ```bash
   pnpm check
   ```

3. テストが通ることを確認:
   ```bash
   pnpm test
   ```

### API実装時の注意事項

- 必ずOpenAPI定義を更新する
- エラーレスポンスは統一フォーマットを使用
- 適切なHTTPステータスコードを返す
- 入力値は必ずZodでバリデーション

### データベース変更時の手順

1. Prismaスキーマを更新
2. マイグレーションファイルを生成
3. ローカルでテスト
4. 本番環境に適用

## セキュリティ考慮事項

- 入力値は必ずZodでバリデーション
- SQLインジェクション対策（Prisma使用）
- XSS対策（フロントエンド実装時）
- レート制限の実装
- 適切な認証・認可チェック

## パフォーマンス考慮事項

- N+1クエリの回避
- 適切なインデックス設計
- キャッシュ戦略（Cloudflare Cache）
- R2への大きなファイルの保存

## 実装済み機能

- ✅ データベーススキーマ（Prisma）
- ✅ プロジェクト基本設定
- ✅ Prisma統合（D1アダプター）

## 未実装機能

未実装機能はLinearで管理されています。主な機能：

- JWT認証システム
- ルール管理API
- バージョン管理システム
- 検索機能
- レート制限
- チーム機能
- CI/CDパイプライン

## ライセンス

[ライセンス情報を追加]