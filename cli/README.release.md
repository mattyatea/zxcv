# zxcv CLI リリース手順

## リリース方法

### 1. タグを使用したリリース（推奨）

```bash
# バージョンタグを作成してプッシュ
git tag cli-v1.0.0
git push origin cli-v1.0.0
```

タグをプッシュすると、GitHub Actionsが自動的に以下を実行します：
1. 全プラットフォーム向けのバイナリをビルド
2. GitHubリリースを作成
3. バイナリをリリースにアップロード

### 2. 手動リリース

GitHub Actionsの「Actions」タブから：
1. 「Release CLI」ワークフローを選択
2. 「Run workflow」をクリック
3. バージョン番号（例：v1.0.0）を入力
4. 「Run workflow」を実行

## ローカルでのクロスプラットフォームビルド

```bash
cd cli
bun run build:cross
```

これにより、`cli/release/`ディレクトリに以下のバイナリが生成されます：
- `zxcv-win-x64.exe` - Windows x64
- `zxcv-linux-x64` - Linux x64
- `zxcv-linux-arm64` - Linux ARM64
- `zxcv-macos-x64` - macOS Intel
- `zxcv-macos-arm64` - macOS Apple Silicon

## サポートプラットフォーム

Bunのクロスコンパイル機能により、以下のプラットフォームをサポート：
- Windows x64
- Linux x64
- Linux ARM64
- macOS x64 (Intel)
- macOS ARM64 (Apple Silicon)

## 注意事項

- Bunのクロスコンパイルは、ホストOSに関係なく全プラットフォーム向けのバイナリを生成可能
- 生成されたバイナリはスタンドアロンで、Bunランタイムのインストールは不要
- Windows向けバイナリは`.exe`拡張子が自動的に付与される