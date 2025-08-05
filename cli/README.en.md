# zxcv CLI

AI coding rules management CLI tool (pnpm-like interface)

[日本語](./README.md)

## Installation

```bash
bun install -g zxcv
```

## Usage

### Getting Started

```bash
# Initialize a new project
zxcv init

# Add rules to your project
zxcv add typescript-rules
zxcv add @myorg/react-rules
zxcv add username/custom-rules

# Install all rules from metadata
zxcv install
zxcv i

# Update rules
zxcv update
zxcv update typescript-rules
zxcv up

# Remove rules
zxcv remove typescript-rules
zxcv rm @myorg/react-rules
```

### Authentication

```bash
# Register a new account
zxcv auth register

# Login (default: Device Authorization Grant)
zxcv auth login

# Interactive login (username/password)
zxcv auth login -i
zxcv auth login --interactive

# Logout
zxcv auth logout
```

### Other Commands

```bash
# Search for rules
zxcv search "typescript"
zxcv search --tags "react,hooks"
zxcv search --owner "username"

# List installed rules
zxcv list
zxcv ls

# Publish a new rule
zxcv publish ./my-rule.md --name my-rule --tags "typescript,react"

# Push changes to your own rules
zxcv push rulename -m "Updated rule"
```

## Configuration

### Environment Variables
- `ZXCV_API_URL`: Override the API endpoint URL

Example:
```bash
export ZXCV_API_URL="https://api.example.com"
zxcv add my-rule
```

### Global Configuration
- Location: `~/.zxcv/config.json`
- Stores authentication token and default settings

### Project Configuration
- Location: `./.zxcvrc.json`
- Override global settings per project

Example `.zxcvrc.json`:
```json
{
  "rulesDir": "./custom-rules",
  "remoteUrl": "https://custom-server.com"
}
```

### Metadata
- Location: `./zxcv-metadata.json`
- Tracks pulled rules and versions

## File Structure

- Rules are stored in `~/.zxcv/rules/`
- Symlinks are created in `./rules/` (configurable)
- Organization rules: `@org/rulename.md`
- User rules: `username/rulename.md`
- Public rules: `rulename.md`

## Development

```bash
# Install dependencies
bun install

# Run in development
bun dev

# Build (generate binary)
bun build

# Test
bun test
```

## License

MIT