# Release v1.2.4

## Changes

- Fix: GitHub Actions (998ae1d)
- Refactor: DBを直接参照しているような箇所をなくす (4103118)
- Fix: testが通らない問題を修正 (a03288d)
- Fix: Format ReportService constructor to single line (a47cb9e)
- Fix: Remove duplicate else block in CLI gitignore.ts (4bfcbab)
- Fix: Resolve linting issues and add Biome to CLI (c56e6f8)
- Fix: Resolve Biome configuration and linting issues (52056c5)
- Fix: BiomeのConfigMiss (a95bc09)
- Feat: Implement report functionality for rules (ad58428)
- Fix: Biomeのfixを適用 (7ae7818)
- Fix: 壊れているsymlinkを削除 (d794e27)
- Update pnpm lockfile (60d42ba)
- Chore: Apply Biome formatting to CLI files and update lockfile (4d09a55)
- Fix: Exclude CSS files from lint by using glob patterns in scripts (4249243)
- Fix: Exclude CSS files from Biome linting (776ba7b)
- Refactor: Unify Biome configuration to root .biome.json (a6270ec)
- Refactor: Improve UserProfile type structure and fix schema validation (07641a9)
- 命名規則が揃っていないのを修正 (0e40190)
- Feat: Create UserService to centralize user data fetching operations (10d6aeb)
- Refactor: Convert UserPackingService to pure utility and move to packing folder (850e4cd)
- Feat: Implement unified UserPackingService for consistent user data formatting (4d7c126)
- Feat: Implement role-based admin and moderator system (376681b)
- 色々修正 (270b6c1)
- Fix Cloudflare deploy paths (79618b1)
- Enhance: Auto-update version in cross-platform build script (156a467)
- Fix: Update CLI version to 1.2.3 and fix install script (82c59de)
- Refactor (c8ec53a)
- Enhance: Add consistent null safety checks across template engine (3336e2e)
- Enhance: Improve type safety for template options (ed9aa40)
- Fix: Resolve template replacement security issues and version switching bugs (04c8dc3)
- Fix: Address additional PR review feedback (5f8eb4a)
- Fix: Address PR review feedback - security and code quality improvements (e32710a)
- Feat: Implement template engine for dynamic rule variables (c8e1ef3)
- Fix: Add missing environment variables to staging configuration (9231ae4)
- Enhance: Add comprehensive OAuth and pagination i18n keys (43048fe)
- Fix: Add missing OAuth translation keys (a043c0d)
- Fix: Remove unused imports and parameters in disabled auth endpoints (4f82150)
- Emailログイン停止に伴って、testもskipするように (ec07412)
- 一旦Emailログインを停止 (bdd178a)

## Release Notes

This release includes:
- Server application updates
- CLI tool updates
- Bug fixes and improvements
- Performance optimizations

## Deployment

- **Staging**: Automatically deployed when merged to `dev`
- **Production**: Automatically deployed when merged to `main`

