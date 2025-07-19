# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**zxcv** is a full-stack application for managing and sharing AI coding rules. This is a Nuxt.js application with Cloudflare Workers integration that provides a platform for sharing and managing coding rules within teams. The application uses:
- **Frontend**: Nuxt 3 with Vue 3, Tailwind CSS, Pinia (for state management)
- **Backend**: oRPC (OpenAPI-based RPC framework) running on Cloudflare Workers
- **Database**: SQLite via Cloudflare D1 with Prisma ORM
- **Development Tools**: Biome for linting/formatting, Vitest for testing
- **Target Market**: Primarily Japan, with i18n support planned
- **Storage**: Cloudflare R2 for rule content (Markdown files), D1 for metadata

## Core Features & Requirements

1. **Rule Visibility Levels**:
   - Public: Accessible to everyone
   - Private: Only accessible to the creator
   - Team: Accessible to team members

2. **Version Control**: All rules support versioning with changelog tracking

3. **Search Functionality**: Full-text search across rules and metadata

4. **Rate Limiting**:
   - Applied to pull operations
   - Different limits for authenticated vs anonymous users
   - Implemented using D1 rate_limits table

5. **Rule Access Patterns**:
   - `/rules/rulename` - Direct rule access
   - `/rules/@org/rulename` - Organization-scoped rules
   - Anonymous users can pull public rules
   - Only creators can push, remove, or publish rules

6. **API Design**:
   - RESTful API with OpenAPI specification
   - JWT authentication for protected endpoints
   - Consistent error responses with proper status codes

## Important Documentation References

**MUST READ** these documentation sites when implementing features:
- **oRPC Documentation**: https://orpc.dev/ - Type-safe RPC framework used for API
- **Nuxt 3 Documentation**: https://nuxt.com/docs - Framework documentation
- **Pinia Documentation**: https://pinia.vuejs.org/ - State management library
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Prisma with D1**: https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1

## Common Commands

### Development
```bash
# Install dependencies (requires pnpm@10.12.1)
pnpm install

# Start development server (runs migrations and starts Nuxt)
pnpm dev

# Run development with Cloudflare Workers preview
pnpm preview
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test suites
pnpm test:unit
pnpm test:integration

# Run a single test file
pnpm vitest run tests/utils/crypto.test.ts
```

### Code Quality
```bash
# Lint code (using Biome)
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check

# Run all checks (lint + format)
pnpm check

# Fix all issues (lint + format)
pnpm check:fix

# Type checking
pnpm typecheck
```

### Database & Deployment
```bash
# Generate Prisma client
pnpm prisma:generate

# Apply migrations locally
pnpm migrate:local

# Apply migrations to production
pnpm migrate:prod

# Build for production
pnpm build

# Deploy to Cloudflare Workers
pnpm deploy
```

## File Structure Guidelines

### Frontend File Organization
```
/components/
  /common/          # 共通コンポーネント (Button, Modal, etc.)
    Button.vue
    Modal.vue
    LoadingSpinner.vue
  /rules/           # ルール関連コンポーネント
    RuleCard.vue
    RuleEditor.vue
    RuleList.vue
  /auth/            # 認証関連コンポーネント
    LoginForm.vue
    RegisterForm.vue
  /layout/          # レイアウトコンポーネント
    Header.vue
    Footer.vue
    Sidebar.vue

/composables/       # Vue Composables
  useAuth.ts        # 認証関連のロジック
  useRules.ts       # ルール操作のロジック
  useToast.ts       # 通知表示のロジック

/stores/            # Pinia Stores
  auth.ts           # 認証状態管理
  rules.ts          # ルール状態管理
  ui.ts             # UI状態管理 (モーダル、ローディング等)

/utils/             # ユーティリティ関数
  validators.ts     # バリデーション関数
  formatters.ts     # データフォーマット関数
  constants.ts      # 定数定義
```

### Backend File Organization
```
/server/
  /api/             # API エンドポイント (もし REST API を追加する場合)
  /orpc/            # oRPC 関連
    /procedures/    # ドメイン別プロシージャ
      auth.ts
      rules.ts
      teams.ts
      users.ts
    /middleware/    # ミドルウェア
      auth.ts
      rateLimit.ts
      validation.ts
  /services/        # ビジネスロジック
    RuleService.ts
    TeamService.ts
    NotificationService.ts
  /repositories/    # データアクセス層
    RuleRepository.ts
    UserRepository.ts
    TeamRepository.ts
  /utils/           # ユーティリティ
    /cloudflare/    # Cloudflare 特有のユーティリティ
      r2.ts
      d1.ts
```

### Component Design Guidelines

1. **Single Responsibility**: 各コンポーネントは単一の責任を持つ
2. **Props Interface**: 必ずTypeScriptでpropsの型定義を行う
3. **Emit Events**: カスタムイベントは型定義付きで定義
4. **Composition API**: Options APIではなくComposition APIを使用

```vue
<!-- 良い例: RuleCard.vue -->
<script setup lang="ts">
interface Props {
  rule: Rule
  showActions?: boolean
}

interface Emits {
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<Emits>()
</script>
```

## Detailed Code Rules

### 1. Code Formatting (Biome Configuration)
- **Indentation**: Tabs (width: 2)
- **Line Width**: 100 characters max
- **Quotes**: Double quotes for strings
- **Semicolons**: Always required
- **Trailing Commas**: Always in multi-line structures
- **Arrow Function Parentheses**: Always required
- **Bracket Spacing**: Enabled

### 2. TypeScript Rules
- **Strict Mode**: Enabled
- **No Explicit Any**: Warned (should be avoided)
- **No Non-Null Assertion**: Warned (use optional chaining)
- **Type Imports**: Use `import type` for type-only imports
- **Const Assertion**: Use `as const` for literal types
- **Enum Initializers**: Required

### 3. Naming Conventions
- **Files**: camelCase or PascalCase
- **Functions**: camelCase (server) / camelCase or PascalCase (client)
- **Variables**: camelCase, PascalCase, or CONSTANT_CASE
- **Types/Interfaces**: PascalCase
- **Object Properties**: camelCase, PascalCase, CONSTANT_CASE, or snake_case (for DB fields)

### 4. Vue/Nuxt Specific Rules
- **Component Files**: PascalCase for component files
- **Single File Components**: Use `<script setup>` syntax
- **Props**: Define with TypeScript interfaces
- **Emits**: Define with TypeScript
- **State Management**: Use Pinia for global state

### 5. oRPC Implementation Patterns
```typescript
// Procedure definition pattern
export const authProcedures = {
  procedureName: os
    .use(dbProvider) // Middleware
    .input(z.object({ // Zod validation
      field: z.string()
    }))
    .handler(async ({ input, context }) => {
      // Implementation
    })
}
```

### 6. Error Handling
- Use `ORPCError` for API errors with proper HTTP status codes
- Log errors with context in server-side code
- Handle errors gracefully in UI with user-friendly messages

### 7. Security Patterns
- JWT tokens stored in localStorage (client-side)
- Bearer token authentication for API calls
- Password hashing with crypto utilities
- Email verification required for accounts
- Rate limiting on sensitive endpoints

### 8. Database Patterns
- Use Prisma for all database operations
- Timestamps in Unix epoch (seconds)
- JSON fields stored as strings
- Soft deletes where applicable
- Proper indexes for performance

### 9. i18n Considerations
- Support for Japanese (ja) and English (en)
- Email templates already support locale-based content
- UI should be designed with i18n in mind
- Default locale: Japanese (for Japan market)

### 10. State Management (Pinia)
```typescript
// Store definition pattern
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  
  // Getters
  const isAuthenticated = computed(() => !!user.value)
  
  // Actions
  async function login(credentials: LoginCredentials) {
    // Implementation using $rpc
  }
  
  return { user, isAuthenticated, login }
})
```

### 11. Import Order Convention
```typescript
// 1. Node.js built-ins
import { readFile } from 'node:fs'

// 2. External dependencies
import { defineStore } from 'pinia'
import { z } from 'zod'

// 3. Internal aliases (~/)
import type { User } from '~/server/types/models'
import { useAuth } from '~/composables/useAuth'

// 4. Relative imports
import { formatDate } from '../utils/formatters'
import Button from './Button.vue'
```

### 12. Error Messages and User Feedback
- エラーメッセージは日本語と英語の両方を用意
- ユーザー向けメッセージは親切で具体的に
- 技術的なエラーはログに記録し、ユーザーには一般的なメッセージを表示

```typescript
// 良い例
try {
  await saveRule(data)
  showToast({ 
    message: locale === 'ja' ? 'ルールを保存しました' : 'Rule saved successfully',
    type: 'success' 
  })
} catch (error) {
  console.error('Rule save error:', error)
  showToast({ 
    message: locale === 'ja' 
      ? 'ルールの保存に失敗しました。もう一度お試しください。' 
      : 'Failed to save rule. Please try again.',
    type: 'error' 
  })
}
```

### 13. API Response Format
```typescript
// 成功レスポンス
interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

// エラーレスポンス
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}
```

### 14. Testing Guidelines
- 各機能に対してユニットテストを作成
- E2Eテストは主要なユーザーフローをカバー
- テストファイルは対象ファイルと同じディレクトリに `.test.ts` 拡張子で配置

```typescript
// rules.test.ts
describe('RuleService', () => {
  it('should create a new rule', async () => {
    // Arrange
    const ruleData = { name: 'test-rule', content: '# Test' }
    
    // Act
    const result = await createRule(ruleData)
    
    // Assert
    expect(result.success).toBe(true)
    expect(result.data.name).toBe('test-rule')
  })
})
```

### 15. Git Commit Message Convention

日本語でわかりやすくコミットメッセージを書く。**1つの作業の区切りなど、意味のあるタイミングでコミットすること。**

```
<Type>: <概要>

<詳細（必要な場合）>
```

Types:
- `Enhance`: 機能改善・拡張
- `Feat`: 新機能追加
- `Fix`: バグ修正
- `Docs`: ドキュメント変更
- `Style`: コードスタイルの変更（機能に影響しない）
- `Refactor`: リファクタリング
- `Test`: テストの追加・修正
- `Chore`: ビルドプロセスやツールの変更

コミットのタイミング:
- 1つの機能が完成したとき
- バグ修正が完了したとき
- リファクタリングが一段落したとき
- テストを追加・修正したとき
- **作業中でも、論理的な区切りがついたとき**

例:
```
Enhance: ルールのバージョン管理機能を改善

- バージョン履歴の表示を高速化
- 差分表示のUIを改善
- ロールバック時の確認ダイアログを追加
```

```
Fix: ログイン時のエラーハンドリングを修正

認証エラー時にトークンが残ってしまう問題を修正
```

```
Feat: チーム機能を実装

- チームの作成・編集・削除
- メンバーの招待機能
- 権限管理（オーナー、メンバー）
```

## Architecture Overview

### Frontend Structure
- **`/pages`**: Nuxt pages using file-based routing
  - Authentication pages: `login.vue`, `register.vue`, `verify-email.vue`
  - Rules management: `/rules/index.vue`, `/rules/new.vue`
- **`/layouts`**: Vue layouts (currently using `default.vue`)
- **`/assets/css`**: Global styles with Tailwind CSS
- **`/plugins`**: Nuxt plugins, including oRPC client setup
- **`/stores`**: Pinia stores for state management (to be created)
- **`/composables`**: Vue composables for shared logic
- **`/components`**: Reusable Vue components

### Backend Architecture
- **`/server/orpc`**: oRPC API implementation
  - **`/procedures`**: API endpoints organized by domain (auth, rules, teams, users, health)
  - **`/middleware`**: Request middleware (auth, database, combined)
  - **`router.ts`**: Main API router configuration
- **`/server/utils`**: Utility functions for auth, crypto, email, JWT, logging, etc.
- **`/server/types`**: TypeScript type definitions
- **`/server/services`**: Business logic services
- **Database Models**: Defined in `/prisma/schema.prisma`
  - Core entities: User, Rule, Team, RuleVersion
  - Supporting tables: ApiKey, RateLimit, EmailVerification, etc.

### Key Design Patterns
1. **oRPC for API**: Type-safe RPC framework with OpenAPI generation
2. **Middleware Chain**: Combined middleware for auth + database access
3. **Repository Pattern**: Planned for data access abstraction (see `/server/repositories`)
4. **D1 Database**: Using Prisma with D1 adapter for SQLite on Cloudflare
5. **Environment-based Configuration**: Different wrangler configs for test/staging/production

### Security Considerations
- JWT-based authentication with secure token handling
- Password hashing using crypto utilities
- Email verification flow
- API key management with scopes
- Rate limiting implementation
- CORS handled by Cloudflare Workers

## Development Notes

- The project uses tabs for indentation (configured in Biome)
- TypeScript strict mode is enabled
- Cloudflare Workers environment with node compatibility mode
- Database migrations are SQL files in `/migrations`
- Test environment uses separate database configuration
- Email sending uses Cloudflare Email Workers
- Always run `pnpm lint` and `pnpm typecheck` before committing

## Automated Code Quality Tools

### Claude Code Hooks
Claude Codeでファイルを編集すると、自動的にBiomeでフォーマットされます。`.claude/settings.json`で設定されています。

### Git Hooks
コミット前に自動的にコード品質チェックが実行されます：
- **pre-commit**: lint-stagedが実行され、ステージングされたファイルに対して：
  - Biomeでのフォーマット（すべての`.ts`, `.tsx`, `.js`, `.jsx`, `.vue`ファイル）
  - TypeScriptの型チェック（`.ts`ファイルのみ）

これにより、コミットされるコードは常に一貫したフォーマットと型安全性が保証されます。

## Best Practices

### 1. Performance Optimization
- Use `lazy` imports for heavy components
- Implement virtual scrolling for large lists
- Cache API responses appropriately
- Use Cloudflare's edge caching capabilities

### 2. Security Best Practices
- Never expose sensitive information in client-side code
- Validate all inputs on both client and server
- Use prepared statements for database queries (handled by Prisma)
- Implement proper CORS policies
- Regular security audits of dependencies

### 3. Accessibility (a11y)
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper color contrast ratios

### 4. Code Review Checklist
- [ ] Code follows the established patterns
- [ ] Tests are written and passing
- [ ] Documentation is updated if needed
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] i18n keys are added for new text
- [ ] Performance impact is considered
- [ ] Security implications are reviewed

## Task Management with Linear

**IMPORTANT**: This project uses Linear for task management. Follow these rules:

1. **Project Name**: Tasks are managed in the "zxcv" project in Linear
2. **Before Starting Work**: Always check if a task exists in Linear before beginning any work
3. **Creating Tasks**: When assigned new work, first verify if it exists in Linear. If not, create a new task
4. **Task Naming Convention**:
   - Use `[Task]` prefix for implementation tasks
   - Use `[QA]` prefix for design questions or issues that need discussion
5. **Status Updates**: Always update the Linear task status when:
   - Starting work on a task (move to "In Progress")
   - Completing a task (move to "Done")
   - Blocking on dependencies (move to "Blocked")
6. **Task Format**: Linear tasks should include:
   - # 概要 (Overview section)
   - # やりたいこと (What we want to achieve section) - with checklist items
   - # もし必要なら必要なパッケージ (Required packages if any)