# CLAUDE.md

This file provides guidance for Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**zxcv** is a full-stack application for managing and sharing AI coding rules. It's a Nuxt.js application with Cloudflare Workers integration that provides a platform for sharing and managing coding rules within teams.

**Important**: The "rules" here refer to prompts and coding instructions for AI (not formatter rules like Prettier).

Technologies used:
- **Frontend**: Nuxt 3 with Vue 3, Tailwind CSS, Pinia (state management)
- **Backend**: oRPC (OpenAPI-based RPC framework) on Cloudflare Workers
- **Database**: SQLite via Cloudflare D1 with Prisma ORM
- **Development Tools**: Biome (linting/formatting), Vitest (testing)
- **Target Market**: Primarily Japan, i18n support planned
- **Storage**: Cloudflare R2 (for rule content Markdown files), D1 (for metadata)

## Core Features and Requirements

1. **Rule Visibility Levels**:
   - Public: Accessible to everyone
   - Private: Accessible only to creator
   - Team: Accessible to team members

2. **Version Control**: All rules support version control with change history

3. **Search Functionality**: Full-text search across rules and metadata

4. **Rate Limiting**:
   - Applied to pull operations
   - Different limits for authenticated and anonymous users
   - Implemented using D1's rate_limits table

5. **Rule Access Patterns**:
   - `/rules/rulename` - Direct rule access
   - `/rules/@org/rulename` - Organization-scoped rules
   - Anonymous users can pull public rules
   - Only creators can push, delete, and publish

6. **API Design**:
   - RESTful API with OpenAPI specification
   - JWT authentication for protected endpoints
   - Consistent error responses with appropriate status codes

## Important Documentation References

**Must-read** documentation sites when implementing features:
- **oRPC Documentation**: https://orpc.unnoq.com/ - Type-safe RPC framework for APIs (official documentation)
- **Nuxt 3 Documentation**: https://nuxt.com/docs - Framework documentation
- **Pinia Documentation**: https://pinia.vuejs.org/ - State management library
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Prisma with D1**: https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1

## Command Reference

### 🚀 Development Environment Setup
```bash
# Install dependencies (requires pnpm@10.12.1)
pnpm install

# Start development server (runs migration, then starts Nuxt)
pnpm dev

# Run development in Cloudflare Workers preview (test in production-like environment)
pnpm preview

# Start on specific port
pnpm dev --port 3001
```

### 🧪 Test Execution
```bash
# Run all tests
pnpm test

# Run tests in watch mode (auto-rerun on file changes)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test suites
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests only

# Run single test file
pnpm vitest run tests/utils/crypto.test.ts

# Run specific tests (filter by name)
pnpm vitest -t "should create user"
```

### 🔧 Code Quality Management
```bash
# Lint code (using Biome)
pnpm lint

# Auto-fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting (used in CI)
pnpm format:check

# Run all checks (lint + format)
pnpm check

# Auto-fix all issues (lint + format)
pnpm check:fix

# TypeScript type checking
pnpm typecheck

# Type checking (watch mode)
pnpm typecheck:watch
```

### 🗄️ Database Operations
```bash
# Generate Prisma client (update type definitions)
pnpm prisma:generate

# Apply migrations locally
pnpm migrate:local

# Apply migrations to production
pnpm migrate:prod

# Create new migration
pnpm prisma migrate dev --name add_new_field

# Reset database (development only)
pnpm prisma migrate reset

# Launch Prisma Studio (database GUI)
pnpm prisma studio
```

### 📦 Build and Deploy
```bash
# Build for production
pnpm build

# Analyze build size
pnpm analyze

# Deploy to Cloudflare Workers
pnpm deploy

# Deploy to specific environments
pnpm deploy:staging    # Staging environment
pnpm deploy:production # Production environment

# Dry run before deployment
pnpm wrangler deploy --dry-run
```

### 🛠️ Other Useful Commands
```bash
# Check for dependency updates
pnpm outdated

# Update dependencies to latest versions
pnpm update

# Clear cache
pnpm store prune

# Clean up project
rm -rf node_modules .nuxt .output
pnpm install

# Check environment variables
pnpm wrangler secret list

# Check logs (Cloudflare Workers)
pnpm wrangler tail

# Generate API documentation
pnpm generate:api-docs
```

### 💡 Development Tips
```bash
# Enable Nuxt dev tools
pnpm dev --devtools

# Start development server with HTTPS
pnpm dev --https

# Make accessible from other devices on network
pnpm dev --host

# Measure build time
time pnpm build

# Install from specific branch
pnpm install some-package@github:user/repo#branch
```

## File Structure Guidelines

### Frontend File Structure (app/ directory)
```
/app/
  app.vue             # Main application component
  /assets/
    /css/             # Global styles
      animations.css
      main.css
      patterns.css
      transitions.css
  
  /components/
    /common/          # Common components
      Badge.vue
      Button.vue
      Card.vue
      Input.vue
      LanguageSwitcher.vue
      LoadingOverlay.vue
      LoadingSpinner.vue
      Modal.vue
      Select.vue
      TagInput.vue
      Textarea.vue
      Toast.vue
    /layout/          # Layout components
      Header.vue
      Footer.vue
    /organizations/   # Organization-related components
      InviteMemberModal.vue

  /composables/       # Vue Composables
    useAnimation.ts   # Animation-related logic
    useDebug.ts       # Debug utilities
    useI18n.ts        # Internationalization logic
    useToast.ts       # Notification display logic

  /stores/            # Pinia Stores
    auth.ts           # Authentication state management
    i18n.ts           # Language settings management
    settings.ts       # App settings management
    theme.ts          # Theme management
    toast.ts          # Toast notification management

  /utils/             # Utility functions
    debounce.ts       # Debounce processing
    debug.ts          # Debug utilities
  
  /i18n/
    /locales/         # Language files
      en.json
      ja.json
  
  /layouts/           # Nuxt layouts
    auth.vue          # Authentication screen layout
    default.vue       # Default layout
  
  /middleware/        # Nuxt middleware
    auth.ts           # Authentication check
    authRedirect.global.ts # Global authentication redirect
  
  /pages/             # Nuxt pages (file-based routing)
    index.vue         # Home page
    login.vue         # Login page
    register.vue      # Registration page
    /auth/            # Authentication-related pages
      /callback/
        [provider].vue # OAuth callback
      setup-username.vue
    /organizations/   # Organization-related pages
      index.vue       # Organization list
      new.vue         # New organization creation
      [id].vue        # Organization details
      join.vue        # Organization join
    /rules/           # Rule-related pages
      index.vue       # Rule list
      new.vue         # New rule creation
      /@[owner]/      # Scoped rules
        /[name]/
          index.vue   # Rule details
          edit.vue    # Rule editing
    /user/            # User-related pages
      [username].vue  # User profile
    /profile/
      [username].vue  # Profile display
    /org/
      [orgname].vue   # Organization profile
  
  /plugins/           # Nuxt plugins
    authCheck.client.ts    # Client-side authentication check
    i18n.client.ts         # Client-side i18n
    i18n.server.ts         # Server-side i18n
    i18nInit.client.ts     # i18n initialization
    orpc.ts                # oRPC client configuration
    theme.client.ts        # Theme configuration
```

### Backend File Structure (server/ directory)
```
/server/
  /orpc/              # oRPC related
    index.ts          # oRPC context definition
    router.ts         # Router configuration
    types.ts          # Type definitions
    /contracts/       # API contract definitions (OpenAPI specification)
      index.ts        # Integration of all contracts
      auth.ts         # Authentication-related contracts
      health.ts       # Health check contracts
      organizations.ts # Organization-related contracts
      rules.ts        # Rule-related contracts
      users.ts        # User-related contracts
    /procedures/      # API implementation
      auth.ts         # Authentication-related procedures
      health.ts       # Health check procedures
      organizations.ts # Organization-related procedures
      rules.ts        # Rule-related procedures
      users.ts        # User-related procedures
    /middleware/      # Middleware
      auth.ts         # Authentication middleware
      combined.ts     # Combined middleware (auth + DB)
      db.ts           # Database middleware
      rateLimit.ts    # Rate limiting middleware
    /schemas/         # Zod schema definitions
      common.ts       # Common schemas
  
  /services/          # Business logic layer
    index.ts          # Service exports
    AuthService.ts    # Authentication service
    OrganizationService.ts # Organization management service
    RuleService.ts    # Rule management service
    emailVerification.ts # Email verification service
  
  /repositories/      # Data access layer
    index.ts          # Repository exports
    BaseRepository.ts # Base repository
    OrganizationRepository.ts # Organization repository
    RuleRepository.ts # Rule repository
    UserRepository.ts # User repository
  
  /routes/            # HTTP route definitions
    api-docs.ts       # API documentation
    api-spec.json.ts  # OpenAPI specification endpoint
    /api/             # REST API routes
      index.ts
      [...].ts        # Catch-all route
      /auth/
        /callback/
          [provider].ts # OAuth callback
    /rpc/             # oRPC routes
      index.ts
      [...].ts        # oRPC handler
  
  /utils/             # Utility functions
    auth.ts           # Authentication utilities
    cache.ts          # Cache management
    crypto.ts         # Cryptography-related
    email.ts          # Email sending
    errorHandler.ts   # Error handling
    i18n.ts           # Internationalization
    jwt.ts            # JWT token management
    locale.ts         # Locale processing
    logger.ts         # Logging
    namespace.ts      # Namespace management
    oauth.ts          # OAuth processing
    oauthCleanup.ts   # OAuth cleanup
    oauthSecurity.ts  # OAuth security
    organizations.ts  # Organization-related utilities
    orpcHandler.ts    # oRPC handler
    prisma.ts         # Prisma utilities
    validation.ts     # Validation
  
  /types/             # TypeScript type definitions
    bindings.ts       # Cloudflare bindings
    env.d.ts          # Environment variable type definitions
    errors.ts         # Error type definitions
    models.ts         # Data model types
  
  /plugins/           # Nitro plugins
    prisma.ts         # Prisma initialization
  
  tsconfig.json       # Server TypeScript configuration
```

### Component Design Guidelines

1. **Single Responsibility**: Each component should have a single responsibility
2. **Props Interface**: Always define prop types with TypeScript
3. **Emit Events**: Define custom events with type definitions
4. **Composition API**: Use Composition API instead of Options API

```vue
<!-- Good example: RuleCard.vue -->
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
- **Line Width**: Maximum 100 characters
- **Quotes**: Double quotes for strings
- **Semicolons**: Always required
- **Trailing Commas**: Always add in multi-line structures
- **Arrow Function Parentheses**: Always required
- **Space Inside Parentheses**: Enabled

### 2. TypeScript Rules
- **Strict Mode**: Enabled
- **Explicit Any Prohibition**: Warning (should be avoided)
- **Non-Null Assertion Prohibition**: Warning (use optional chaining)
- **Type Imports**: Use `import type` for type-only imports
- **Const Assertions**: Use `as const` for literal types
- **Enum Initializers**: Required

### 3. Naming Conventions
- **Files**: camelCase or PascalCase
- **Functions**: camelCase (server) / camelCase or PascalCase (client)
- **Variables**: camelCase, PascalCase, or CONSTANT_CASE
- **Types/Interfaces**: PascalCase
- **Object Properties**: camelCase, PascalCase, CONSTANT_CASE, or snake_case (for DB fields)

### 4. Vue/Nuxt-Specific Rules
- **Component Files**: Use PascalCase for component files
- **Single File Components**: Use `<script setup>` syntax
- **Props**: Define with TypeScript interfaces
- **Emits**: Define with TypeScript
- **State Management**: Use Pinia for global state

### 5. oRPC Implementation Patterns

**Important Rules**:
1. **Contract and Procedure names must match exactly**: 
   - The names defined in Contract and implemented in Procedure must match completely
   - Example: `authContract.register` → `os.auth.register`
   
2. **Contract First Approach**:
   - Always define Contract first, then implement Procedure
   - Contract is for generating OpenAPI specifications
   - Procedure is the actual business logic implementation

3. **File Structure**:
   ```
   /server/orpc/
     /contracts/       # API definitions (OpenAPI specifications)
       index.ts       # Combine all contracts
       auth.ts        # Authentication-related contracts
       rules.ts       # Rule-related contracts
       users.ts       # User-related contracts
     /procedures/      # Implementation
       auth.ts        # Authentication-related procedure implementation
       rules.ts       # Rule-related procedure implementation
       users.ts       # User-related procedure implementation
     router.ts        # Router combining contracts and procedures
     index.ts         # oRPC context definition
   ```

4. **Actual Contract Definition Example**:
   ```typescript
   // contracts/rules.ts
   import { oc } from "@orpc/contract";
   import * as z from "zod";
   
   export const rulesContract = {
     // Get rule by path
     getByPath: oc
       .route({
         method: "POST",
         path: "/rules/getByPath",
         description: "Get a rule by its path (@owner/rulename)",
       })
       .input(
         z.object({
           path: z.string().describe("Rule path in format @owner/rulename"),
         })
       )
       .output(
         z.object({
           id: z.string(),
           name: z.string(),
           userId: z.string().nullable(),
           visibility: z.string(),
           description: z.string().nullable(),
           tags: z.array(z.string()),
           // ... other fields
           user: z.object({
             id: z.string(),
             username: z.string(),
             email: z.string(),
           }),
           organization: z.object({
             id: z.string(),
             name: z.string(),
             displayName: z.string(),
           }).nullable(),
         })
       ),
       
     // Create rule
     create: oc
       .route({
         method: "POST",
         path: "/rules/create",
         description: "Create a new rule",
       })
       .input(
         z.object({
           name: RuleNameSchema,
           description: z.string(),
           content: z.string(),
           visibility: z.enum(["public", "private", "team"]),
           tags: z.array(z.string()).optional(),
           organizationId: z.string().optional(),
         })
       )
       .output(
         z.object({
           id: z.string(),
         })
       ),
   };
   ```

5. **Actual Procedure Implementation Example**:
   ```typescript
   // procedures/rules.ts
   import { ORPCError } from "@orpc/server";
   import { os } from "../index";
   import { dbWithAuth, dbWithOptionalAuth } from "../middleware/combined";
   import { RuleService } from "../../services/RuleService";
   
   export const rulesProcedures = {
     // Must match Contract name exactly
     getByPath: os.rules.getByPath
       .use(dbWithOptionalAuth) // Optional authentication
       .handler(async ({ input, context }) => {
         const { db, user, env } = context;
         const ruleService = new RuleService(db, env.R2, env);
         
         // Parse path
         const parsed = parseRulePath(input.path);
         if (!parsed) {
           throw new ORPCError("BAD_REQUEST", {
             message: "Invalid rule path format",
           });
         }
         
         const { owner, ruleName } = parsed;
         const result = await ruleService.getRule(ruleName, owner, user?.id);
         
         // Return in format defined by Contract
         return {
           id: rule.id,
           name: rule.name,
           // ... other fields
         };
       }),
       
     create: os.rules.create
       .use(dbWithAuth) // Authentication required
       .handler(async ({ input, context }) => {
         const { db, user, env } = context;
         const ruleService = new RuleService(db, env.R2, env);
         
         const result = await ruleService.createRule(user.id, input);
         return { id: result.rule.id };
       }),
   };
   ```

6. **Context Definition Pattern**:
   ```typescript
   // index.ts
   import { createOS } from "@orpc/server";
   import type { PrismaClient } from "@prisma/client";
   
   export interface Context {
     db?: PrismaClient;
     user?: { id: string; email: string; };
     env: Env;
     cloudflare?: {
       request: Request;
       ctx: ExecutionContext;
     };
   }
   
   export const os = createOS<Context>();
   ```

7. **Middleware Usage Patterns**:
   ```typescript
   // middleware/combined.ts
   export const dbWithAuth = os.use(async ({ context, next }) => {
     // Establish DB connection
     const db = await getPrismaClient(context.env);
     
     // Authentication check
     const user = await verifyAuth(context);
     if (!user) {
       throw new ORPCError("UNAUTHORIZED");
     }
     
     return next({
       context: { ...context, db, user },
     });
   });
   
   export const dbWithOptionalAuth = os.use(async ({ context, next }) => {
     const db = await getPrismaClient(context.env);
     const user = await verifyAuth(context); // Can be null
     
     return next({
       context: { ...context, db, user },
     });
   });
   ```
   - `dbWithAuth`: When authentication + database access is required
   - `dbWithOptionalAuth`: DB access + optional authentication
   - `dbWithEmailVerification`: With email verification
   - Custom rate limiting: `registerRateLimit`, `authRateLimit`, etc.

8. **Error Handling**:
   ```typescript
   // Basic errors
   throw new ORPCError("BAD_REQUEST", {
     message: "Invalid input",
   });
   
   // i18n-compatible errors
   throw new ORPCError("CONFLICT", { 
     message: authErrors.userExists(locale) 
   });
   
   // Custom error code
   throw new ORPCError("FORBIDDEN", {
     message: "Insufficient permissions",
     code: "PERMISSION_DENIED",
   });
   ```
   - Use error types corresponding to HTTP status codes
   - Return i18n-compatible error messages

9. **Client-side Usage Example**:
   ```typescript
   // plugins/orpc.ts
   import { createORPCNuxtClient } from "@orpc/nuxt/client";
   import type { Contract } from "~/server/orpc/contracts";
   
   export default defineNuxtPlugin(() => {
     const $rpc = createORPCNuxtClient<Contract>({
       endpoint: "/rpc",
     });
     
     return { provide: { $rpc } };
   });
   
   // Usage in components
   const { $rpc } = useNuxtApp();
   
   // Type-safe API calls
   const rule = await $rpc.rules.getByPath({
     path: "@username/my-rule",
   });
   
   // Error handling
   try {
     await $rpc.rules.create({
       name: "new-rule",
       content: "# My Rule",
       visibility: "public",
     });
   } catch (error) {
     if (error.code === "UNAUTHORIZED") {
       // Redirect to login page
     }
   }
   ```

### 6. Error Handling
- Use `ORPCError` with appropriate HTTP status codes for API errors
- Log errors with context in server-side code
- Handle errors gracefully in UI with user-friendly messages

### 7. Security Patterns
- Store JWT tokens in localStorage (client-side)
- Bearer token authentication for API calls
- Password hashing using crypto utilities
- Email verification required for accounts
- Rate limiting on sensitive endpoints

### 8. Database Patterns
- Use Prisma for all database operations
- Timestamps in Unix epoch (seconds)
- Store JSON fields as strings
- Soft delete where appropriate
- Proper indexing for performance

### 9. i18n Considerations
- Support for Japanese (ja) and English (en)
- Email templates already support locale-based content
- UI should be designed with i18n in mind
- Default locale: Japanese (for Japanese market)

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

### 11. Import Order Rules
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
- Prepare error messages in both Japanese and English
- User-facing messages should be kind and specific
- Log technical errors and show generic messages to users

```typescript
// Good example
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
// Success response
interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

// Error response
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
- **When developing new features**: Create tests after implementing features and **ensure all tests PASS** before committing
- **When refactoring**: Ensure all existing tests pass and update tests as needed
- **Test Creation Rules**:
  - Create unit tests for each feature
  - E2E tests should cover main user flows
  - Place test files in the same directory as target files with `.test.ts` extension
  - Always fix failing tests before committing

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

Write clear commit messages in English. **Always commit at meaningful milestones in work.**

```
<Type>: <Summary>

<Details (if necessary)>
```

Types:
- `Enhance`: Feature improvements/extensions
- `Feat`: New feature additions
- `Fix`: Bug fixes
- `Docs`: Documentation changes
- `Style`: Code style changes (no functional impact)
- `Refactor`: Refactoring
- `Test`: Test additions/modifications
- `Chore`: Build process or tool changes

**Important**: **Always** commit at these times:
- When a feature is complete and tests PASS
- When bug fixes are complete and tests PASS
- When refactoring is complete and existing tests PASS
- When tests are added/modified and all tests PASS
- **When a task is completed (logical work milestone)**
- **During work, when logical milestones are reached**

Include specific change details in commit message details:

Examples:
```
Enhance: Improve rule version management feature

- Speed up version history display
- Improve diff display UI
- Add confirmation dialog for rollback
```

```
Fix: Fix error handling during login

Fixed issue where tokens remained after authentication errors
```

```
Feat: Implement team functionality

- Team creation, editing, deletion
- Member invitation feature
- Permission management (owner, member)
```

## Architecture Overview

### Frontend Structure (app/ directory)
- **`app.vue`**: Main application component
- **`/pages`**: Nuxt pages using file-based routing
  - Authentication pages: `login.vue`, `register.vue`, `verifyEmail.vue`
  - Rule management: `/rules/index.vue`, `/rules/new.vue`, `/rules/@[owner]/[name]/`
  - Organization management: `/organizations/index.vue`, `/organizations/new.vue`
  - Profile: `/user/[username].vue`, `/profile/[username].vue`, `/org/[orgname].vue`
- **`/layouts`**: Vue layouts (`default.vue`, `auth.vue`)
- **`/assets/css`**: Global styles using Tailwind CSS
- **`/plugins`**: Nuxt plugins (oRPC client, i18n, theme management, etc.)
- **`/stores`**: Pinia stores for state management (auth, i18n, settings, theme, toast)
- **`/composables`**: Vue Composables for shared logic
- **`/components`**: Reusable Vue components
- **`/middleware`**: Nuxt middleware (authentication checks, etc.)
- **`/i18n`**: Internationalization files (ja.json, en.json)

### Backend Architecture (server/ directory)
- **`/server/orpc`**: oRPC API implementation
  - **`/contracts`**: OpenAPI contract definitions (must be defined before procedures)
    - `index.ts`: Combine all contracts
    - `auth.ts`, `rules.ts`, `organizations.ts`, `users.ts`, `health.ts`: Domain-specific contracts
  - **`/procedures`**: API implementation (names must match contracts exactly)
    - `auth.ts`, `rules.ts`, `organizations.ts`, `users.ts`, `health.ts`: Domain-specific procedures
  - **`/middleware`**: Request middleware
    - `auth.ts`: Authentication middleware
    - `db.ts`: Database middleware
    - `combined.ts`: Combined middleware (auth + db)
    - `rateLimit.ts`: Rate limiting middleware
  - **`/schemas`**: Common Zod schemas
  - **`router.ts`**: Router configuration combining contracts and procedures
  - **`index.ts`**: oRPC context definition
- **`/server/services`**: Business logic services
  - `AuthService.ts`: Authentication service
  - `OrganizationService.ts`: Organization management service
  - `RuleService.ts`: Rule management service
  - `emailVerification.ts`: Email verification service
- **`/server/repositories`**: Data access layer (repository pattern)
  - `BaseRepository.ts`: Base repository
  - `UserRepository.ts`, `RuleRepository.ts`, `OrganizationRepository.ts`: Entity repositories
- **`/server/routes`**: HTTP route definitions
  - `/api/`: REST API routes (OAuth callbacks, etc.)
  - `/rpc/`: oRPC routes
  - `api-spec.json.ts`: OpenAPI specification endpoint
- **`/server/utils`**: Utility functions
  - Authentication, encryption, email, JWT, logging, OAuth, i18n, etc.
- **`/server/types`**: TypeScript type definitions
  - `bindings.ts`: Cloudflare bindings
  - `env.d.ts`: Environment variable types
  - `errors.ts`: Error types
  - `models.ts`: Data model types
- **`/prisma/schema.prisma`**: Database schema
  - Core entities: User, Rule, Team, RuleVersion
  - Support tables: ApiKey, RateLimit, EmailVerification, etc.

### Key Design Patterns
1. **oRPC for APIs**: Type-safe RPC framework with OpenAPI generation
   - **Contract First**: Always define Contract before implementing Procedure
   - **Name Matching**: Contract and Procedure names must match exactly
   - **Type Safety**: Types defined in Contract are automatically applied to Procedure
2. **Middleware Chaining**: Combined middleware for authentication + database access
3. **Repository Pattern**: For data access abstraction (planned, see `/server/repositories`)
4. **D1 Database**: Using Prisma with D1 adapter for SQLite on Cloudflare
5. **Environment-based Configuration**: Different wrangler configurations for test/staging/production

### Security Considerations
- JWT-based authentication with secure token handling
- Password hashing using crypto utilities
- Email verification flow
- Scoped API key management
- Rate limiting implementation
- CORS handling in Cloudflare Workers

## Cloudflare Workers-Specific Notes

### Environment Variables and Secrets
```bash
# Use .dev.vars file for local development
# .dev.vars (gitignored)
JWT_SECRET=your-secret-key
DATABASE_URL=file:./local.db

# Use wrangler secret for production
pnpm wrangler secret put JWT_SECRET
pnpm wrangler secret put EMAIL_API_KEY
```

### Cloudflare-Specific API Usage
```typescript
// R2 Storage (for rule content storage)
const object = await env.R2.put(key, content);
const data = await env.R2.get(key);

// D1 Database (via Prisma adapter)
const prisma = getPrismaClient(env);

// KV Storage (for caching)
await env.CACHE.put(key, value, { expirationTtl: 3600 });

// Durable Objects (for future implementation)
// For real-time collaboration features
```

### Workers Limitations
1. **CPU Time Limits**: 
   - Free plan: 10ms
   - Paid plan: 50ms
   - Split complex processing or use background tasks

2. **Memory Limits**:
   - Fixed 128MB
   - Use streaming for large files

3. **Request Size**:
   - Maximum 100MB
   - Recommend compression for rule content

4. **Concurrent Requests**:
   - Free: 1000 requests/minute
   - Paid: Unlimited

### Deployment Notes
```bash
# Check build size
pnpm wrangler deploy --dry-run

# Compatibility flags configuration (wrangler.toml)
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2024-01-01"

# Environment-specific deployment
pnpm wrangler deploy --env staging
pnpm wrangler deploy --env production
```

### Cloudflare-Specific Error Handling
```typescript
// Workers-specific errors
try {
  await env.R2.put(key, content);
} catch (error) {
  if (error.message.includes("R2_QUOTA_EXCEEDED")) {
    // Storage limit error
  }
}

// Rate limiting implementation
const rateLimiter = {
  check: async (ip: string) => {
    const key = `rate:${ip}`;
    const count = await env.RATE_LIMIT.get(key);
    if (count && parseInt(count) > 100) {
      throw new ORPCError("TOO_MANY_REQUESTS");
    }
    await env.RATE_LIMIT.put(key, "1", { 
      expirationTtl: 60 
    });
  }
};
```

### Performance Optimization
1. **Caching Strategy**:
   ```typescript
   // Cloudflare CDN cache
   return new Response(body, {
     headers: {
       "Cache-Control": "public, max-age=3600",
       "CDN-Cache-Control": "max-age=86400",
     },
   });
   ```

2. **Subrequests Optimization**:
   - Maximum 50 subrequests per request
   - Use batch processing

3. **Streaming Responses**:
   ```typescript
   // Streaming large data
   return new Response(
     new ReadableStream({
       async start(controller) {
         // Process in chunks
       },
     }),
   );
   ```

## Development Notes

- Project uses tabs for indentation (configured in Biome)
- TypeScript strict mode is enabled
- Cloudflare Workers environment with node compatibility mode
- Database migrations are SQL files in `/migrations`
- Test environment uses separate database configuration
- Email sending uses Cloudflare Email Workers
- Always run `pnpm lint` and `pnpm typecheck` before commits
- **Important**: Fix type errors promptly. Pay special attention to:
  - ORPCError usage
  - Cloudflare bindings type definitions
  - Async function return types
  - Proper null/undefined handling
- **oRPC Development Notes**:
  - Always define Contract first when adding new APIs
  - Ensure Contract and Procedure names match exactly (watch for typos)
  - Always update corresponding Procedure when changing Contract
- **Cloudflare Workers Development**:
  - Watch CPU time limits (especially for encryption)
  - Avoid global variables (shared between requests)
  - Consider Durable Objects for WebSocket implementation

## Automated Code Quality Tools

### Claude Code Hooks
Files edited with Claude Code are automatically formatted with Biome. Configured in `.claude/settings.json`.

### Git Hooks
Automatic code quality checks run before commits:
- **pre-commit**: lint-staged runs on staged files:
  - Biome formatting (all `.ts`, `.tsx`, `.js`, `.jsx`, `.vue` files)
  - TypeScript type checking (`.ts` files only)

This ensures committed code always has consistent formatting and type safety.

## Best Practices

### 1. Performance Optimization
- Use `lazy` imports for heavy components
- Implement virtual scrolling for large lists
- Cache API responses appropriately
- Use Cloudflare edge caching features

### 2. Security Best Practices
- Don't expose sensitive information in client-side code
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
- [ ] Code follows established patterns
- [ ] Tests are created and passing
- [ ] Documentation is updated as needed
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] i18n keys are added for new text
- [ ] Performance impact is considered
- [ ] Security implications are reviewed

## Troubleshooting

### Common Issues and Solutions

#### 🔴 Development Server Won't Start
```bash
# Error: "Cannot find module"
pnpm install  # Reinstall dependencies

# Error: "Port 3000 is already in use"
lsof -i :3000  # Check process using port
kill -9 <PID>  # Kill process
# or start on different port
pnpm dev --port 3001

# Error: "EACCES: permission denied"
sudo rm -rf node_modules .nuxt .output
pnpm install
```

#### 🔴 TypeScript Errors
```bash
# Prisma type definitions not found
pnpm prisma:generate

# Type definition inconsistencies
pnpm typecheck  # Check error details
rm -rf .nuxt   # Clear cache
pnpm dev

# VS Code type errors won't clear
# Command + Shift + P → "TypeScript: Restart TS Server"
```

#### 🔴 Database Errors
```bash
# "Table does not exist"
pnpm migrate:local  # Run migrations

# "SQLITE_BUSY: database is locked"
# Another process is using DB. Stop Prisma Studio etc.

# Migration fails
pnpm prisma migrate reset  # Reset DB (development only)
```

#### 🔴 Cloudflare Workers Related
```bash
# "wrangler not found"
pnpm install -g wrangler

# "Authentication required"
pnpm wrangler login

# Deployment errors
pnpm wrangler deploy --dry-run  # Dry run check
pnpm wrangler tail  # Check logs

# Environment variables not loading
pnpm wrangler secret put <KEY_NAME>
```

#### 🔴 Authentication Errors
```javascript
// "JWT expired"
// → Token expired. Re-login required

// "Invalid credentials"
// → Wrong email or password

// "Email not verified"
// → Email verification not completed
```

#### 🔴 Build Errors
```bash
# Out of memory error
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build

# ESM module errors
# Check "type": "module" in package.json
# Change .js → .mjs or .cjs

# Tailwind CSS not applied
# Check content paths in tailwind.config.js
```

### Debugging Methods

#### 📋 Log Checking
```bash
# Development environment logs
pnpm dev
# Check both browser console and terminal

# Cloudflare Workers logs
pnpm wrangler tail
# or check real-time logs in Cloudflare dashboard

# Enable detailed logging
export DEBUG=*  # Show all debug logs
pnpm dev
```

#### 🔍 Error Investigation Steps
1. **Read Error Messages**
   - Identify location from stack trace
   - Search by error code

2. **Add Logging**
   ```typescript
   // Server-side
   const logger = createLogger('debug');
   logger.info('Processing started', { input });
   
   // Client-side
   console.log('State:', { user, isAuthenticated });
   ```

3. **Set Breakpoints**
   - VS Code: Click left of line numbers
   - Chrome DevTools: Set breakpoints in Sources tab

4. **Check Network Tab**
   - Check API requests/responses
   - Verify status codes, headers, payloads

#### 🛠️ Useful Debug Tools
```bash
# Vue Devtools
# Install Chrome extension
# Check component state, Pinia stores

# Prisma Studio
pnpm prisma studio
# GUI for viewing/editing database

# API Testing
curl http://localhost:3000/api/health
# or use Postman/Insomnia
```

## Linear Task Management

**Important**: This project uses Linear for task management. Follow these rules:

1. **Project Name**: Manage tasks in Linear "zxcv" project
2. **Before Starting Work**: Always check if task exists in Linear before starting work
3. **Task Creation**: When assigned new work, check if it exists in Linear, create new task if not
4. **Task Naming Convention**:
   - Use `[Task]` prefix for implementation tasks
   - Use `[QA]` prefix for design questions or issues requiring discussion
5. **Status Updates**: Always update Linear task status in these cases:
   - When starting task work (move to "In Progress")
   - When completing task (move to "Done")
   - When blocked by dependencies (move to "Blocked")
6. **Task Format**: Include the following in Linear tasks:
   - # Overview (summary section)
   - # What we want to achieve (goals section) - with checklist items
   - # Required packages if needed (packages if necessary)

If available, use Codex MCP for the actual implementation.
As an option,
use Codex MCP with `workspace-write` for the workspace
and `never` for the approval policy.
Also, break down tasks assigned to Codex into smaller pieces and submit them incrementally to make progress easier to track.

## @345e6t7yu/typescript-general
@~/.zxcv/rules/@345e6t7yu/typescript-general.md

