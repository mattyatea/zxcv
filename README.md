[日本語版](README.md) | [English Version](README-EN.md)

# zxcv

<img src='./img.png' alt='zxcv logo' height='693' style='object-fit: cover;'/>


# 概要
zxcvは、AIを活用する際の、コーディングルールなどを一元化したいというCLIツールです。

https://zxcv.nanasi-apps.xyz/ で、ルールを共有することができます。

また、ゴリゴリにClaude Codeを活用して開発されています。

## CLIのインストール

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
zxcv add/install @username/rule-name

# ルールを検索
zxcv search "typescript"
```

## ライセンス

MIT License

## コントリビューション

大歓迎です！！
Issueを作成して、そのIssueに紐づくPRを作成してください！

## サポート

バグや、機能の要望や、問題がある場合は、GitHubのissueを作成して教えてください！
また、自分で解決できる！という方は、PRを作成していただけると助かります！
