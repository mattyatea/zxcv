# Release v1.2.3

## Changes

- Fix: Add missing environment variables to staging configuration (9231ae4)
- Enhance: Add comprehensive OAuth and pagination i18n keys (43048fe)
- Fix: Add missing OAuth translation keys (a043c0d)
- Fix: Remove unused imports and parameters in disabled auth endpoints (4f82150)
- Emailログイン停止に伴って、testもskipするように (ec07412)
- 一旦Emailログインを停止 (bdd178a)
- actionsのifを変えてみる (3eda17d)
- Lintを通るように (e1adb0a)
- ルールを追加 (0f7a886)
- Refactor: Simplify UI and unify language to English (059e2ce)
- Enhance: Add Agents.md support and interactive gitignore configuration (9b0ac0b)
- Enhance: Add interactive CLI prompts with arrow key navigation (2d31b12)
- Enhance: Add workflow_dispatch to post-release and remove health checks (795ec91)

## Release Notes

This release includes:
- Server application updates
- CLI tool updates
- Bug fixes and improvements
- Performance optimizations

## Deployment

- **Staging**: Automatically deployed when merged to `dev`
- **Production**: Automatically deployed when merged to `main`

