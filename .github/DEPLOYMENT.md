# CI/CD デプロイメントガイド

## 概要

このプロジェクトは GitHub Actions を使用して CI/CD パイプラインを構築しています。

## ワークフロー

### 1. CI (継続的インテグレーション)
- **ファイル**: `.github/workflows/ci.yml`
- **トリガー**: プッシュ、プルリクエスト
- **内容**:
  - TypeScript 型チェック
  - Biome による lint/format チェック
  - テスト実行
  - テストカバレッジ生成
  - セキュリティ監査

### 2. CD (継続的デプロイ)
- **ファイル**: `.github/workflows/deploy.yml`
- **トリガー**: main ブランチへのプッシュ
- **内容**:
  - テスト実行
  - セキュリティ監査
  - D1 マイグレーション
  - Cloudflare Workers デプロイ
  - ヘルスチェック

### 3. セキュリティ監査
- **ファイル**: `.github/workflows/security.yml`
- **トリガー**: 週次スケジュール、プッシュ、プルリクエスト
- **内容**:
  - 依存関係の脆弱性チェック
  - アウトデート依存関係の確認
  - ライセンス確認
  - 依存関係レビュー

## 必要な Secrets 設定

GitHub リポジトリの Settings > Secrets and variables > Actions で以下を設定してください：

### Cloudflare 認証
- `CLOUDFLARE_API_TOKEN`: Cloudflare API トークン
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare アカウント ID

### JWT 認証
- `JWT_SECRET_STAGING`: ステージング環境用 JWT シークレット
- `JWT_SECRET_PRODUCTION`: 本番環境用 JWT シークレット
- `REFRESH_TOKEN_SECRET_STAGING`: ステージング環境用リフレッシュトークンシークレット
- `REFRESH_TOKEN_SECRET_PRODUCTION`: 本番環境用リフレッシュトークンシークレット

### URL 設定
- `STAGING_URL`: ステージング環境の URL
- `PRODUCTION_URL`: 本番環境の URL

## 環境設定

### ステージング環境
- ブランチ: `develop`
- 環境: `staging`
- 自動デプロイ: `develop` ブランチへのプッシュ時

### 本番環境
- ブランチ: `main`
- 環境: `production`
- 自動デプロイ: `main` ブランチへのプッシュ時

## デプロイメント手順

### 1. 開発からステージング
```bash
git checkout develop
git merge feature/your-feature
git push origin develop
```

### 2. ステージングから本番
```bash
git checkout main
git merge develop
git push origin main
```

### 3. 手動デプロイ
GitHub Actions の "Deploy" ワークフローから手動実行可能

## ヘルスチェック

デプロイ後、以下のエンドポイントで健康状態を確認できます：

```bash
curl https://your-domain.com/health
```

レスポンス例：
```json
{
  "status": "healthy",
  "timestamp": 1642678800000,
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production"
}
```

## トラブルシューティング

### デプロイメント失敗
1. GitHub Actions のログを確認
2. Cloudflare の設定を確認
3. 環境変数の設定を確認
4. D1 マイグレーションの状態を確認

### テスト失敗
1. ローカルでテストを実行
2. 依存関係の更新を確認
3. 環境設定の違いを確認

### セキュリティ監査失敗
1. 脆弱性のある依存関係を更新
2. `pnpm audit fix` を実行
3. 必要に応じて手動で依存関係を更新

## 監視とアラート

- テストカバレッジ: Codecov
- セキュリティ監査: 週次自動実行
- デプロイメント状況: GitHub Actions

## 参考リンク

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm Documentation](https://pnpm.io/)