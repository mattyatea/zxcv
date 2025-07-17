# GitHub Actions デプロイメント設定

## 必要なシークレット

以下のシークレットをGitHubリポジトリに設定する必要があります：

### 共通
- `CLOUDFLARE_API_TOKEN` - Cloudflare APIトークン（Workers & D1 デプロイ権限）
- `CLOUDFLARE_ACCOUNT_ID` - CloudflareアカウントID
- `D1_DATABASE_NAME` - D1データベース名（デフォルト: zxcv-db）

### ステージング環境
- `JWT_SECRET_STAGING` - JWT署名用シークレット
- `REFRESH_TOKEN_SECRET_STAGING` - リフレッシュトークン用シークレット
- `STAGING_URL` - ステージング環境のURL（ヘルスチェック用）

### 本番環境
- `JWT_SECRET_PRODUCTION` - JWT署名用シークレット
- `REFRESH_TOKEN_SECRET_PRODUCTION` - リフレッシュトークン用シークレット
- `PRODUCTION_URL` - 本番環境のURL（ヘルスチェック用）

## デプロイフロー

1. **develop ブランチ** → ステージング環境へ自動デプロイ
2. **main ブランチ** → 本番環境へ自動デプロイ

## ワークフローの内容

- Node.js 22を使用
- pnpmでの依存関係インストール
- テスト実行
- セキュリティ監査（本番のみ）
- D1データベースマイグレーション
- Cloudflare Workersへのデプロイ
- ヘルスチェック