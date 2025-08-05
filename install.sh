#!/bin/bash

# zxcv CLI installer script
# Usage: curl -fsSL https://raw.githubusercontent.com/mattyatea/zxcv/dev/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
INSTALL_DIR="/usr/local/bin"
BINARY_NAME="zxcv"
VERSION="latest"
GITHUB_REPO="mattyatea/zxcv"

# Detect OS and architecture
detect_platform() {
    local os arch
    
    os=$(uname -s | tr '[:upper:]' '[:lower:]')
    arch=$(uname -m)
    
    case "${os}" in
        darwin)
            OS="macos"
            ;;
        linux)
            OS="linux"
            ;;
        mingw*|cygwin*|msys*)
            OS="windows"
            ;;
        *)
            echo -e "${RED}Error: Unsupported operating system: ${os}${NC}"
            exit 1
            ;;
    esac
    
    case "${arch}" in
        x86_64|amd64)
            ARCH="x64"
            ;;
        aarch64|arm64)
            ARCH="arm64"
            ;;
        *)
            echo -e "${RED}Error: Unsupported architecture: ${arch}${NC}"
            exit 1
            ;;
    esac
}

# Get latest release version from GitHub API
get_latest_version() {
    if command -v curl >/dev/null 2>&1; then
        VERSION=$(curl -s "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    elif command -v wget >/dev/null 2>&1; then
        VERSION=$(wget -qO- "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    else
        echo -e "${RED}Error: curl or wget is required${NC}"
        exit 1
    fi
    
    if [[ -z "$VERSION" ]]; then
        echo -e "${YELLOW}Warning: Could not fetch latest version, using cli-v1.1.0${NC}"
        VERSION="cli-v1.1.0"
    fi
}

# Construct download URL and filename
construct_download_info() {
    if [[ "$OS" == "windows" ]]; then
        FILENAME="zxcv-win-${ARCH}.exe"
        BINARY_NAME="zxcv.exe"
    else
        FILENAME="zxcv-${OS}-${ARCH}"
    fi
    
    DOWNLOAD_URL="https://github.com/${GITHUB_REPO}/releases/download/${VERSION}/${FILENAME}"
    CHECKSUMS_URL="https://github.com/${GITHUB_REPO}/releases/download/${VERSION}/checksums.sha256"
}

# Download file
download_file() {
    local url="$1"
    local output="$2"
    
    echo -e "${BLUE}Downloading ${url}...${NC}"
    
    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$url" -o "$output"
    elif command -v wget >/dev/null 2>&1; then
        wget -q "$url" -O "$output"
    else
        echo -e "${RED}Error: curl or wget is required${NC}"
        exit 1
    fi
}

# Verify checksum
verify_checksum() {
    local file="$1"
    local checksums_file="$2"
    
    if [[ ! -f "$checksums_file" ]]; then
        echo -e "${YELLOW}Warning: Checksums file not found, skipping verification${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Verifying checksum...${NC}"
    
    local expected_checksum
    expected_checksum=$(grep "$(basename "$file")" "$checksums_file" | cut -d' ' -f1)
    
    if [[ -z "$expected_checksum" ]]; then
        echo -e "${YELLOW}Warning: Checksum not found for $(basename "$file"), skipping verification${NC}"
        return 0
    fi
    
    local actual_checksum
    if command -v shasum >/dev/null 2>&1; then
        actual_checksum=$(shasum -a 256 "$file" | cut -d' ' -f1)
    elif command -v sha256sum >/dev/null 2>&1; then
        actual_checksum=$(sha256sum "$file" | cut -d' ' -f1)
    else
        echo -e "${YELLOW}Warning: shasum or sha256sum not found, skipping checksum verification${NC}"
        return 0
    fi
    
    if [[ "$expected_checksum" == "$actual_checksum" ]]; then
        echo -e "${GREEN}✓ Checksum verification passed${NC}"
    else
        echo -e "${RED}✗ Checksum verification failed${NC}"
        echo -e "${RED}Expected: $expected_checksum${NC}"
        echo -e "${RED}Actual:   $actual_checksum${NC}"
        exit 1
    fi
}

# Remove macOS quarantine attributes
remove_quarantine() {
    local file="$1"
    
    if [[ "$OS" == "macos" ]]; then
        echo -e "${BLUE}Removing macOS quarantine attributes...${NC}"
        if command -v xattr >/dev/null 2>&1; then
            xattr -rc "$file" 2>/dev/null || true
            echo -e "${GREEN}✓ Quarantine attributes removed${NC}"
        else
            echo -e "${YELLOW}Warning: xattr command not found, skipping quarantine removal${NC}"
        fi
    fi
}

# Install binary
install_binary() {
    local temp_file="$1"
    local install_path="${INSTALL_DIR}/${BINARY_NAME}"
    
    echo -e "${BLUE}Installing to ${install_path}...${NC}"
    
    # Create install directory if it doesn't exist
    if [[ ! -d "$INSTALL_DIR" ]]; then
        echo -e "${BLUE}Creating directory ${INSTALL_DIR}...${NC}"
        sudo mkdir -p "$INSTALL_DIR"
    fi
    
    # Copy and set permissions
    sudo cp "$temp_file" "$install_path"
    sudo chmod +x "$install_path"
    
    # Remove quarantine attributes after installation
    remove_quarantine "$install_path"
    
    echo -e "${GREEN}✓ zxcv CLI installed successfully to ${install_path}${NC}"
}

# Check if binary works
verify_installation() {
    echo -e "${BLUE}Verifying installation...${NC}"
    
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        local version_output
        version_output=$("$BINARY_NAME" --version 2>/dev/null || true)
        echo -e "${GREEN}✓ zxcv CLI is working: ${version_output}${NC}"
    else
        echo -e "${YELLOW}Warning: ${BINARY_NAME} not found in PATH. You may need to add ${INSTALL_DIR} to your PATH.${NC}"
        echo -e "${YELLOW}Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.):${NC}"
        echo -e "${YELLOW}export PATH=\"${INSTALL_DIR}:\$PATH\"${NC}"
    fi
}

# Cleanup temporary files
cleanup() {
    if [[ -f "$TEMP_FILE" ]]; then
        rm -f "$TEMP_FILE"
    fi
    if [[ -f "$CHECKSUMS_FILE" ]]; then
        rm -f "$CHECKSUMS_FILE"
    fi
}

# Main installation function
main() {
    echo -e "${GREEN}🚀 zxcv CLI Installer${NC}"
    echo -e "${BLUE}==============================${NC}"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --version)
                VERSION="$2"
                shift 2
                ;;
            --install-dir)
                INSTALL_DIR="$2"
                shift 2
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --version VERSION    Install specific version (default: latest)"
                echo "  --install-dir DIR    Install directory (default: /usr/local/bin)"
                echo "  --help              Show this help message"
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                exit 1
                ;;
        esac
    done
    
    # Detect platform
    detect_platform
    echo -e "${BLUE}Detected platform: ${OS}-${ARCH}${NC}"
    
    # Get latest version if not specified
    if [[ "$VERSION" == "latest" ]]; then
        get_latest_version
    fi
    echo -e "${BLUE}Installing version: ${VERSION}${NC}"
    
    # Construct download information
    construct_download_info
    
    # Set up temporary files
    TEMP_DIR=$(mktemp -d)
    TEMP_FILE="${TEMP_DIR}/${FILENAME}"
    CHECKSUMS_FILE="${TEMP_DIR}/checksums.sha256"
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Download binary and checksums
    download_file "$DOWNLOAD_URL" "$TEMP_FILE"
    download_file "$CHECKSUMS_URL" "$CHECKSUMS_FILE" || true
    
    # Verify checksum
    verify_checksum "$TEMP_FILE" "$CHECKSUMS_FILE"
    
    # Remove quarantine attributes before installation
    remove_quarantine "$TEMP_FILE"
    
    # Install binary
    install_binary "$TEMP_FILE"
    
    # Verify installation
    verify_installation
    
    echo -e "${GREEN}🎉 Installation completed successfully!${NC}"
    echo -e "${BLUE}Run 'zxcv --help' to get started.${NC}"
}

# Run main function
main "$@"