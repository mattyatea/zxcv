# zxcv - AI Coding Rules Sharing Platform

zxcvは、AIコーディングルールを管理・共有するためのフルスタックアプリケーションです。

## 機能

- AIコーディングルールの作成・管理・共有
- バージョン管理
- チーム機能
- Google/GitHubでのソーシャルログイン
- 全文検索
- レート制限

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## デプロイ

### GitHub Actionsを使用した自動デプロイ

このプロジェクトはGitHub Actionsを使用してCloudflare Workersに自動デプロイされます。

#### 必要なGitHub Secrets

以下のSecretsをGitHubリポジトリに設定してください：

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

#### デプロイフロー

- `main`ブランチにプッシュ → 本番環境にデプロイ
- `dev`ブランチにプッシュ → ステージング環境にデプロイ

### ローカル開発

ローカル開発環境では`.env`ファイルを作成して環境変数を設定してください：

```bash
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

## 技術スタック

- **Frontend**: Nuxt 3, Vue 3, Tailwind CSS, Pinia
- **Backend**: oRPC, Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite), Prisma ORM
- **Storage**: Cloudflare R2
- **Authentication**: JWT, OAuth 2.0 (Google, GitHub)
- **Development**: TypeScript, Biome, Vitest
- **API Documentation**: OpenAPI 3.0, Swagger UI

## API Documentation

本プロジェクトはOpenAPI 3.0仕様に準拠したREST APIを提供しています。

### APIドキュメントへのアクセス

開発サーバーを起動後、以下のURLでアクセスできます：

- **Swagger UI (インタラクティブドキュメント)**: http://localhost:3000/api-docs
- **OpenAPI仕様書 (JSON形式)**: http://localhost:3000/api-spec.json

### APIエンドポイント

APIのベースURLは `/api` です。主なエンドポイント：

- `/api/auth/*` - 認証関連
- `/api/rules/*` - ルール管理
- `/api/organizations/*` - 組織管理
- `/api/users/*` - ユーザー管理
- `/api/health` - ヘルスチェック

### 認証

保護されたエンドポイントへのアクセスには、Bearerトークン認証が必要です：

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/users/me
```
