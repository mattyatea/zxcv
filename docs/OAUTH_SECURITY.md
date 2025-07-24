# OAuth セキュリティ強化ドキュメント

## 概要

PRレビューでの指摘を受けて、OAuth実装のセキュリティを強化しました。

## 実装されたセキュリティ対策

### 1. State検証の強化

#### 既存の実装
- ✅ `crypto.getRandomValues()`による暗号学的に安全なランダム値生成
- ✅ データベースへのstate保存によるフォージ防止
- ✅ タイミング攻撃を防ぐ`safeCompare`関数の使用
- ✅ プロバイダーの一致確認
- ✅ 有効期限チェック
- ✅ 使用済みstateの即時削除

#### 追加実装
- ✅ Nonceフィールドによる追加のエントロピー
- ✅ クライアントIPアドレスの追跡
- ✅ IP単位での試行回数制限
- ✅ OAuthレスポンスパラメータの検証

### 2. Open Redirect対策

```typescript
// リダイレクトURLの検証
validateRedirectUrl(url: string, allowedDomains: string[]): boolean
```

- 相対URLの許可
- ホワイトリストベースのドメイン検証
- ワイルドカードサブドメインのサポート

### 3. レート制限の強化

- IP単位での保留中state数の制限（最大5個）
- OAuthエラー時の詳細なエラーメッセージ
- 試行回数のトラッキング

### 4. データベーススキーマの更新

```sql
-- OAuth stateテーブルへのセキュリティフィールド追加
ALTER TABLE oauth_states ADD COLUMN client_ip TEXT;
ALTER TABLE oauth_states ADD COLUMN nonce TEXT;
ALTER TABLE oauth_states ADD COLUMN attempt_count INTEGER DEFAULT 0;
CREATE INDEX idx_oauth_states_client_ip ON oauth_states(client_ip);
```

### 5. セキュリティ設定の集約

```typescript
export const OAUTH_CONFIG = {
  STATE_EXPIRATION: 600, // 10分
  MAX_PENDING_STATES_PER_IP: 5,
  OAUTH_RATE_LIMIT: {
    windowMs: 900 * 1000, // 15分
    maxRequests: 10,
  },
};
```

## セキュリティチェックリスト

- [x] CSRF保護（state parameter）
- [x] PKCE（Google OAuth）
- [x] タイミング攻撃対策
- [x] Open Redirect対策
- [x] レート制限
- [x] 期限切れstateの自動クリーンアップ
- [x] エラーメッセージの適切な処理
- [x] IPベースの監視

## 今後の検討事項

1. **ログ記録の強化**
   - セキュリティイベントの詳細なログ
   - 異常なパターンの検出

2. **アカウントリンク時の追加確認**
   - 既存アカウントとのリンク時にメール確認
   - リンク解除機能の実装

3. **セッション管理**
   - デバイス単位でのセッション管理
   - 異常なログインの検知

## 参考資料

- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP OAuth 2.0 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)