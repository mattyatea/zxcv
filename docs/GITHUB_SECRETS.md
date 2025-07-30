# GitHub Secrets設定ガイド

このドキュメントでは、zxcvアプリケーションをCloudflare Workersにデプロイするために必要なGitHub Secretsの設定方法を説明します。

## 必要なSecrets

以下のSecretsをGitHubリポジトリに設定する必要があります：

### 1. Cloudflare関連

- **`CLOUDFLARE_API_TOKEN`** (必須)
  - Cloudflare APIトークン
  - 取得方法：
    1. [Cloudflareダッシュボード](https://dash.cloudflare.com/profile/api-tokens)にアクセス
    2. 「Create Token」をクリック
    3. 「Custom token」を選択
    4. 以下の権限を付与：
       - Account: Cloudflare Workers Scripts:Edit
       - Account: Account Settings:Read
       - Zone: Workers Routes:Edit (必要に応じて)
    5. トークンを生成してコピー

- **`CLOUDFLARE_ACCOUNT_ID`** (必須)
  - CloudflareアカウントID
  - 取得方法：
    1. [Cloudflareダッシュボード](https://dash.cloudflare.com/)にアクセス
    2. 右側のサイドバーからアカウントIDをコピー

### 2. アプリケーション認証

- **`JWT_SECRET`** (必須)
  - JWT署名用のシークレットキー
  - 生成方法：
    ```bash
    openssl rand -base64 32
    ```
  - または任意の安全なランダム文字列（32文字以上推奨）

### 3. OAuth認証

#### Google OAuth

- **`GOOGLE_CLIENT_ID`** (必須)
  - Google OAuth 2.0クライアントID
  - 取得方法：
    1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
    2. プロジェクトを作成または選択
    3. 「APIとサービス」→「認証情報」に移動
    4. 「認証情報を作成」→「OAuth クライアント ID」を選択
    5. アプリケーションタイプは「ウェブアプリケーション」を選択
    6. 承認済みのリダイレクトURIに以下を追加：
       - `https://your-app-domain.workers.dev/api/auth/callback/google`
       - `http://localhost:3000/api/auth/callback/google` (開発用)
    7. 作成後、クライアントIDをコピー

- **`GOOGLE_CLIENT_SECRET`** (必須)
  - Google OAuth 2.0クライアントシークレット
  - 上記の手順で同時に取得

#### GitHub OAuth

- **`GH_OAUTH_CLIENT_ID`** (必須)
  - GitHub OAuthアプリケーションのクライアントID
  - 取得方法：
    1. [GitHub Settings](https://github.com/settings/developers)にアクセス
    2. 「OAuth Apps」→「New OAuth App」をクリック
    3. 以下の情報を入力：
       - Application name: `zxcv`
       - Homepage URL: `https://your-app-domain.workers.dev`
       - Authorization callback URL: `https://your-app-domain.workers.dev/api/auth/callback/github`
    4. アプリケーションを作成後、Client IDをコピー

- **`GH_OAUTH_CLIENT_SECRET`** (必須)
  - GitHub OAuthアプリケーションのクライアントシークレット
  - 取得方法：
    1. 作成したOAuth Appの設定ページで「Generate a new client secret」をクリック
    2. 生成されたシークレットをコピー（一度しか表示されません）

**注意**: GitHub ActionsのSecretsでは`GITHUB_`で始まる名前は使用できないため、`GH_OAUTH_`プレフィックスを使用しています。

## GitHub Secretsの設定方法

1. GitHubリポジトリのページを開く
2. 「Settings」タブをクリック
3. 左側のメニューから「Secrets and variables」→「Actions」を選択
4. 「New repository secret」をクリック
5. 各Secretの名前と値を入力して保存

## 環境別の設定

本番環境とステージング環境で異なる値を使用する場合は、GitHub Environmentsを使用することをお勧めします：

1. 「Settings」→「Environments」で環境を作成（例：`production`、`staging`）
2. 各環境にSecretを設定
3. ワークフローファイルで環境を指定：
   ```yaml
   jobs:
     deploy:
       environment: production
   ```

## セキュリティに関する注意事項

- Secretsの値は絶対にコミットしないでください
- ローカル開発では`.env`ファイルを使用し、`.gitignore`に追加してください
- Secretsは定期的に更新することを推奨します
- 最小権限の原則に従い、必要最小限の権限のみを付与してください

## トラブルシューティング

### デプロイが失敗する場合

1. すべての必須Secretsが設定されているか確認
2. Cloudflare APIトークンの権限を確認
3. OAuth URLの設定が正しいか確認（特にリダイレクトURI）
4. GitHub Actionsのログを確認してエラーメッセージを特定

### OAuthログインが機能しない場合

1. クライアントIDとシークレットが正しく設定されているか確認
2. リダイレクトURIが登録されているURIと完全に一致しているか確認
3. 本番環境のURLがOAuthアプリケーションに登録されているか確認