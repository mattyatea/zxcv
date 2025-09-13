# 🚀 Release Guide

This document describes the automated release process for the zxcv project.

## 🎯 How to Create a Release

### 1. Trigger Release Workflow

1. Go to **Actions** tab in GitHub
2. Select **"Prepare Release"** workflow  
3. Click **"Run workflow"**
4. Fill in the parameters:
   - **Version**: `v1.2.0` (semantic versioning)
   - **Release Type**: `patch`, `minor`, or `major`
   - **Include CLI**: Check if CLI should be included in this release

### 2. Automated Process

The system will automatically:

✅ **Create Release Branch**: `release/v1.2.0`
✅ **Update Versions**: Bump package.json files
✅ **Run Tests**: Ensure code quality
✅ **Build Applications**: Verify builds work
✅ **Generate Changelog**: Based on git commits
✅ **Create PR to Main**: Ready for review
✅ **Create Draft Release**: On GitHub

### 3. Review and Merge

1. **Review the PR**: Check changes and version updates
2. **Approve and Merge**: Merge the PR to `main` branch
3. **Production Deploy**: Automatic deployment to production
4. **Release Finalization**: Tags, assets, and cleanup

## 🔄 Complete Release Flow

```mermaid
graph TD
    A[Manual Trigger] --> B[Create Release Branch]
    B --> C[Update Versions]
    C --> D[Run Tests & Build]
    D --> E[Create PR to Main]
    E --> F[Review PR]
    F --> G[Merge to Main]
    G --> H[Deploy to Production]
    H --> I[Create Git Tag]
    I --> J[Publish Release]
    J --> K[Upload CLI Assets]
    K --> L[Merge back to Dev]
    L --> M[Cleanup]
```

## 📦 Release Contents

### Server Application
- Nuxt.js web application
- oRPC API backend  
- Automatically deployed to production

### CLI Tool (Optional)
- Bun-based CLI application
- Cross-platform binaries
- Uploaded as GitHub release assets

## 🏷️ Version Management

We follow [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR** (`1.0.0`): Breaking changes
- **MINOR** (`0.1.0`): New features (backwards compatible)
- **PATCH** (`0.0.1`): Bug fixes (backwards compatible)

## 🌍 Deployment Environments

- **Staging**: `dev` branch → https://zxcv-staging.mattyatea.me
- **Production**: `main` branch → https://zxcv.nanasi-apps.xyz

## 🔧 Post-Release Actions

The system automatically:

1. **Creates Git Tags**: For version tracking
2. **Publishes GitHub Release**: From draft to public
3. **Uploads CLI Assets**: If CLI is included
4. **Merges Back to Dev**: Keeps branches synchronized
5. **Cleans Up**: Removes temporary release branches

## ⚠️ Important Notes

### Pre-Release Checks
- All tests must pass ✅
- Builds must succeed ✅  
- No lint errors ❌

### Manual Steps Required
- Review and approve the PR
- Verify deployment works correctly
- Test critical functionality

### Rollback Process
If issues are found:
1. Revert the merge commit on `main`
2. Redeploy previous version
3. Delete problematic git tag
4. Mark GitHub release as pre-release

## 🛠️ Customization

### Adding Release Steps
Edit `.github/workflows/release.yml` to add custom steps:
- Database migrations
- Cache invalidation  
- Notification sending

### CLI Release Assets
CLI builds are handled in `.github/workflows/post-release.yml`:
- Cross-platform compilation
- Asset upload to GitHub releases
- Checksum generation

## 📝 Changelog Generation

Changelogs are automatically generated from:
- Git commit messages
- PR titles and descriptions
- Closed issues between releases

Use conventional commits for better changelog:
```
feat: add user profile page
fix: resolve authentication issue  
docs: update API documentation
```

## 🚨 Troubleshooting

### Release Workflow Fails
- **Check workflow logs**: Go to Actions tab and examine detailed logs
- **Verify secrets**: Ensure `GITHUB_TOKEN`, `CLOUDFLARE_API_TOKEN`, etc. are set
- **Branch permissions**: Confirm PR creation permissions are enabled
- **Concurrency conflicts**: Ref-based concurrency prevents overlapping releases
- **Release detection**: Multiple methods ensure reliable commit identification
- **Health endpoints**: Verify `/api/health` and `/rpc/health.check` are accessible

### Common Error Scenarios

#### CLI Build Failures
- **Bun installation verification**: Comprehensive setup validation with PATH checks
- **Dependencies with retry**: Up to 3 attempts with 10-second delays for network resilience
- **Dual build strategy**: Cross-platform build with single-platform fallback
- **Asset verification**: Confirms binary creation and validates release artifacts
- **Graceful degradation**: Release continues without CLI if builds fail (with warnings)
- **Detailed diagnostics**: Build output capture and specific error guidance

#### Git Operation Failures
- **Push failures**: Network issues or branch conflicts (auto-cleanup on failure)
- **Tag conflicts**: Tag already exists (skips duplicate tag creation)
- **Merge conflicts**: Manual resolution required for dev branch merge

#### Deployment Issues
- **Multi-layer verification**: GitHub deployment API + health endpoint monitoring
- **Extended monitoring**: Up to 30 attempts over 10 minutes with adaptive timeouts
- **Health endpoint checks**: Tests `/api/health` and `/rpc/health.check` endpoints
- **Response validation**: Verifies not just HTTP 200 but actual response content
- **Graceful timeout handling**: Continues with warning if verification inconclusive
- **Manual fallback**: Clear guidance for manual verification when automation fails

### Enhanced Error Handling

The system now includes:
- **Multi-method release detection**: Commit messages, PR metadata, and package.json changes
- **Comprehensive health monitoring**: GitHub deployment API + direct endpoint health checks
- **Robust concurrency control**: Ref-based grouping prevents simultaneous releases
- **Retry mechanisms** for network operations (3-30 attempts depending on operation)
- **Automatic cleanup** of failed Git operations and artifacts
- **Detailed error messages** with actionable guidance
- **Graceful degradation** when non-critical operations fail
- **CLI build resilience**: Cross-platform builds with single-platform fallback

### Manual Recovery Steps

If a release fails:
1. **Check the workflow logs** for specific error messages
2. **Clean up artifacts**: Delete failed release branch if created
3. **Address root cause**: Fix code, dependencies, or configuration
4. **Retry release**: Run the workflow again with same or updated version

---

For questions or issues with releases, please create an issue in the repository.