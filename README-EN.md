[日本語版](README.md) | [English Version](README-EN.md)
# zxcv

<img src='./img.png' alt='zxcv logo' height='693' style='object-fit: cover;'/>

# Overview

zxcv is a CLI tool designed to centralize coding rules and guidelines when working with AI. 

You can share rules at https://zxcv.nanasi-apps.xyz/

This project is heavily developed using Claude Code.

## CLI Installation

### Automatic Installation (Recommended)

```bash
# Install latest version
curl -fsSL https://raw.githubusercontent.com/nanasi-apps/zxcv/dev/install.sh | bash

# Install specific version
curl -fsSL https://raw.githubusercontent.com/nanasi-apps/zxcv/dev/install.sh | bash -s -- --version cli-v1.1.0

# Custom installation directory
curl -fsSL https://raw.githubusercontent.com/nanasi-apps/zxcv/dev/install.sh | bash -s -- --install-dir ~/.local/bin
```

### Manual Installation

1. Download the appropriate binary from [Releases](https://github.com/mattyatea/zxcv/releases)
2. Verify SHA256 checksum:
   ```bash
   shasum -a 256 -c checksums.sha256
   ```
3. Grant execution permissions and add to PATH:
   ```bash
   chmod +x zxcv-*
   # For macOS, remove quarantine attributes
   xattr -rc zxcv-* 2>/dev/null || true
   sudo mv zxcv-* /usr/local/bin/zxcv
   ```

### Usage

```bash
# Show help
zxcv --help

# Initialize project
zxcv init

# Authentication
zxcv auth login

# Add/install rules
zxcv add/install @username/rule-name

# Search rules
zxcv search "typescript"
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions are very welcome!
Please create an issue and submit a PR linked to that issue!

## 📞 Support

If you encounter bugs, feature requests, or issues, please create a GitHub issue!
If you can solve it yourself, we'd appreciate a PR!