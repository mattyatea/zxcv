# zxcv - AI Coding Rules Sharing Platform

zxcvは、AIコーディングルールを管理・共有するためのモノレポプロジェクトです。

## 🏗️ プロジェクト構成

このプロジェクトは、pnpmワークスペースを使用したモノレポ構成になっています：

```
zxcv/
├── server/          # Nuxt.js + Cloudflare Workersベースのウェブアプリケーション (Node.js)
├── cli/             # Bunベースのコマンドラインツール
├── pnpm-workspace.yaml
└── package.json     # ルートパッケージ（ワークスペース管理）
```

### server/ - Webアプリケーション
- **フレームワーク**: Nuxt 3 + Vue 3
- **ランタイム**: Node.js + Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite) + Prisma ORM
- **認証**: JWT + OAuth 2.0 (Google, GitHub)

### cli/ - コマンドラインツール
- **ランタイム**: Bun
- **ビルドツール**: Bun bundler
- **用途**: AIコーディングルールの管理、プッシュ/プル操作

## ✨ 機能

- 📝 AIコーディングルールの作成・管理・共有
- 🔄 バージョン管理
- 👥 チーム/組織機能
- 🔐 Google/GitHubでのソーシャルログイン
- 🔍 全文検索
- ⚡ レート制限
- 🌐 i18n対応（日本語・英語）

## 📦 CLI インストール

### 自動インストール（推奨）

```bash
# 最新版をインストール
curl -fsSL https://raw.githubusercontent.com/mattyatea/zxcv/dev/install.sh | bash

# 特定のバージョンをインストール
curl -fsSL https://raw.githubusercontent.com/mattyatea/zxcv/dev/install.sh | bash -s -- --version cli-v1.1.0

# カスタムインストールディレクトリ
curl -fsSL https://raw.githubusercontent.com/mattyatea/zxcv/dev/install.sh | bash -s -- --install-dir ~/.local/bin
```

### 手動インストール

1. [Releases](https://github.com/mattyatea/zxcv/releases)から適切なバイナリをダウンロード
2. SHA256チェックサムを検証：
   ```bash
   shasum -a 256 -c checksums.sha256
   ```
3. 実行権限を付与し、PATHに配置：
   ```bash
   chmod +x zxcv-*
   # macOSの場合、quarantine属性を削除
   xattr -rc zxcv-* 2>/dev/null || true
   sudo mv zxcv-* /usr/local/bin/zxcv
   ```

### 使用方法

```bash
# ヘルプを表示
zxcv --help

# プロジェクトを初期化
zxcv init

# 認証
zxcv auth login

# ルールを追加
zxcv add @username/rule-name

# ルールを検索
zxcv search "typescript"
```

## 🚀 セットアップ

### 前提条件

- Node.js 18+
- pnpm 10.12.1
- Bun 1.0+ (CLIツール用)

### 依存関係のインストール

```bash
# ルートディレクトリで実行（両方のプロジェクトの依存関係をインストール）
pnpm install
```

### 環境変数の設定

1. サーバー用の環境変数:
```bash
cd server
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

2. CLI用の設定:
```bash
cd cli
# 必要に応じて設定ファイルを作成
```

## 💻 開発

### 開発サーバーの起動

```bash
# サーバーの開発環境を起動 (http://localhost:3000)
pnpm dev:server

# CLIの開発環境を起動（別ターミナルで）
pnpm dev:cli
```

### テストの実行

```bash
# すべてのテストを実行
pnpm test

# サーバーのテストのみ
pnpm -F server test

# CLIのテストのみ
pnpm -F cli test
```

### コード品質チェック

```bash
# リント
pnpm lint
pnpm lint:fix     # 自動修正

# フォーマット
pnpm format       # フォーマット実行
pnpm format:check # フォーマットチェックのみ

# 型チェック
pnpm typecheck

# すべてのチェック
pnpm check        # リント + フォーマットチェック
pnpm check:fix    # リント + フォーマット自動修正
```

### データベース操作

```bash
# Prismaクライアントの生成
pnpm prisma:generate

# マイグレーション（ローカル）
pnpm migrate:local

# マイグレーション（本番）
pnpm migrate:prod
```

## 🏭 ビルド

```bash
# サーバーをビルド
pnpm build:server

# CLIをビルド
pnpm build:cli

# サーバーのプレビュー（Cloudflare Workers環境）
pnpm preview:server
```

## 📦 デプロイ

### サーバーのデプロイ (Cloudflare Workers)

#### GitHub Actionsを使用した自動デプロイ

このプロジェクトはGitHub Actionsを使用してCloudflare Workersに自動デプロイされます。

**必要なGitHub Secrets:**

1. **Cloudflare関連**
   - `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
   - `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID

2. **アプリケーション認証**
   - `JWT_SECRET`: JWT署名用のシークレットキー

3. **OAuth認証**
   - `GOOGLE_CLIENT_ID`: Google OAuth 2.0クライアントID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth 2.0クライアントシークレット
   - `GH_OAUTH_CLIENT_ID`: GitHub OAuthアプリケーションのクライアントID
   - `GH_OAUTH_CLIENT_SECRET`: GitHub OAuthアプリケーションのクライアントシークレット

詳細な設定方法は[GitHub Secretsガイド](./docs/GITHUB_SECRETS.md)を参照してください。

**デプロイフロー:**
- `main`ブランチにプッシュ → 本番環境にデプロイ
- `dev`ブランチにプッシュ → ステージング環境にデプロイ

### CLIの配布

```bash
cd cli
bun build
# dist/index.js が生成される
```

## 📚 API Documentation

本プロジェクトはOpenAPI 3.0仕様に準拠したREST APIを提供しています。

### APIドキュメントへのアクセス

開発サーバーを起動後、以下のURLでアクセスできます：

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI仕様書**: http://localhost:3000/api-spec.json

### 主なAPIエンドポイント

- `/api/auth/*` - 認証関連
- `/api/rules/*` - ルール管理
- `/api/organizations/*` - 組織管理
- `/api/users/*` - ユーザー管理
- `/api/health` - ヘルスチェック

## 🛠️ 技術スタック

### サーバー
- **Frontend**: Nuxt 3, Vue 3, Tailwind CSS, Pinia
- **Backend**: oRPC, Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite), Prisma ORM
- **Storage**: Cloudflare R2
- **Authentication**: JWT, OAuth 2.0

### CLI
- **Runtime**: Bun
- **Language**: TypeScript
- **Testing**: Bun test

### 共通
- **Code Quality**: Biome (linting/formatting)
- **Version Control**: Git + GitHub
- **Package Manager**: pnpm (workspace)

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストは歓迎します。大きな変更の場合は、まずissueを開いて変更内容について議論してください。

## 📞 サポート

質問や問題がある場合は、GitHubのissueを作成してください。