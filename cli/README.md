# zxcv CLI

AIコーディングルール管理CLIツール（pnpmライクなインターフェース）

[English](./README.en.md)

## インストール

```bash
bun install -g zxcv
```

## 使い方

### はじめに

```bash
# 新しいプロジェクトを初期化
zxcv init

# プロジェクトにルールを追加
zxcv add typescript-rules
zxcv add @myorg/react-rules
zxcv add username/custom-rules

# メタデータからすべてのルールをインストール
zxcv install
zxcv i

# ルールを更新
zxcv update
zxcv update typescript-rules
zxcv up

# ルールを削除
zxcv remove typescript-rules
zxcv rm @myorg/react-rules
```

### 認証

```bash
# 新しいアカウントを登録
zxcv auth register

# ログイン
zxcv auth login

# ログアウト
zxcv auth logout
```

### その他のコマンド

```bash
# ルールを検索
zxcv search "typescript"
zxcv search --tags "react,hooks"
zxcv search --owner "username"

# インストール済みのルールを一覧表示
zxcv list
zxcv ls

# 新しいルールを公開
zxcv publish ./my-rule.md --name my-rule --tags "typescript,react"

# 自分のルールに変更をプッシュ
zxcv push rulename -m "ルールを更新"
```

## 設定

### 環境変数
- `ZXCV_API_URL`: APIエンドポイントURLを上書き

例:
```bash
export ZXCV_API_URL="https://api.example.com"
zxcv add my-rule
```

### グローバル設定
- 場所: `~/.zxcv/config.json`
- 認証トークンとデフォルト設定を保存

### プロジェクト設定
- 場所: `./.zxcvrc.json`
- プロジェクトごとにグローバル設定を上書き

`.zxcvrc.json`の例:
```json
{
  "rulesDir": "./custom-rules",
  "remoteUrl": "https://custom-server.com"
}
```

### メタデータ
- 場所: `./zxcv-metadata.json`
- プルされたルールとバージョンを追跡

## ファイル構造

- ルールは `~/.zxcv/rules/` に保存されます
- シンボリックリンクは `./rules/` に作成されます（設定可能）
- 組織のルール: `@org/rulename.md`
- ユーザーのルール: `username/rulename.md`

## 開発

```bash
# 依存関係をインストール
bun install

# 開発モードで実行
bun dev

# ビルド（バイナリ生成）
bun build

# テスト
bun test
```

## ライセンス

MIT