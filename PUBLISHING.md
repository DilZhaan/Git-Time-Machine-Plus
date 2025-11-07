# Publishing Guide

Complete guide for publishing the Git Time Machine extension to VS Code Marketplace and Open VSX Registry.

## 📋 Prerequisites

### 1. Install Publishing Tools

```bash
npm install
```

This installs:
- `@vscode/vsce` - VS Code Marketplace publishing
- `ovsx` - Open VSX Registry publishing
- `rimraf` - Clean build artifacts

### 2. Create Publisher Account (VS Code Marketplace)

1. Go to [Visual Studio Marketplace Management](https://marketplace.visualstudio.com/manage)
2. Sign in with Microsoft account
3. Click **Create Publisher**
4. Fill in:
   - **Publisher ID**: `your-publisher-name` (update in package.json)
   - **Display Name**: Your name or organization
   - **Description**: Brief description

### 3. Get Personal Access Token (PAT) - VS Code

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Click **User Settings** → **Personal Access Tokens**
3. Click **New Token**
4. Configure:
   - **Name**: `vscode-marketplace-publish`
   - **Organization**: All accessible organizations
   - **Expiration**: Custom (recommend 90 days)
   - **Scopes**: Click "Show all scopes" → Check **Marketplace: Manage**
5. Click **Create** and **copy the token** (won't be shown again)

### 4. Login to VSCE

```bash
npx vsce login your-publisher-name
```

Enter your PAT when prompted.

### 5. Get Open VSX Token (Optional)

1. Go to [Open VSX Registry](https://open-vsx.org/)
2. Login with GitHub
3. Go to [Access Tokens](https://open-vsx.org/user-settings/tokens)
4. Click **Generate New Token**
5. Copy the token

### 6. Set Environment Variables

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export OVSX_TOKEN="your-openvsx-token-here"

# Or set for current session only
export OVSX_TOKEN="your-openvsx-token-here"
```

---

## 🔨 Pre-Publishing Checklist

### Code Quality

- [ ] All TypeScript files compile without errors
- [ ] No ESLint warnings or errors
- [ ] All features tested manually
- [ ] No console.log statements left in code

```bash
npm run build
```

### Package.json

- [ ] Version number updated
- [ ] Publisher name set correctly
- [ ] Display name is accurate
- [ ] Description is compelling (< 200 chars)
- [ ] Icon path is correct
- [ ] Repository URL is set
- [ ] Keywords are relevant
- [ ] Categories are appropriate

### Documentation

- [ ] README.md is complete and up-to-date
- [ ] CHANGELOG.md reflects all changes
- [ ] LICENSE file exists
- [ ] All placeholder text replaced
- [ ] Screenshots added (or placeholders noted)

### Media Assets

- [ ] Icon (128x128) exists at `media/icon.png`
- [ ] Banner (1280x640) for marketplace
- [ ] Screenshots prepared (recommend 3-5)

### Testing

```bash
# Create package locally
npm run package

# Install locally to test
code --install-extension git-time-machine-0.0.1.vsix

# Test in a real repository
# Verify all features work
```

---

## 📦 Building & Packaging

### Build Only

```bash
# Compile and lint
npm run build
```

### Package Extension

```bash
# Creates .vsix file
npm run package
```

This creates: `git-time-machine-X.Y.Z.vsix`

### Clean Build Artifacts

```bash
# Remove out/ folder and .vsix files
npm run clean
```

---

## 🚀 Publishing

### Option 1: Publish to VS Code Marketplace Only

```bash
npm run publish:vscode
```

### Option 2: Publish to Open VSX Only

```bash
npm run publish:openvsx
```

### Option 3: Publish to Both Marketplaces

```bash
npm run publish:all
```

This will:
1. Publish to VS Code Marketplace
2. Publish to Open VSX Registry

---

## 🔄 Version Management

### Automated Version Bumps

```bash
# Patch version (0.0.1 → 0.0.2)
npm run version:patch

# Minor version (0.0.1 → 0.1.0)
npm run version:minor

# Major version (0.0.1 → 1.0.0)
npm run version:major
```

These scripts will:
1. Update version in package.json
2. Create git commit
3. Create git tag
4. Push to repository
5. Push tags

### Manual Version Update

```bash
# Edit package.json version manually
npm version 0.0.2 --no-git-tag-version

# Then commit
git add package.json
git commit -m "chore: bump version to 0.0.2"
git tag v0.0.2
git push && git push --tags
```

---

## 📝 Complete Publishing Workflow

### First-Time Publishing

```bash
# 1. Ensure everything is ready
npm run build

# 2. Update version if needed
npm run version:patch

# 3. Update CHANGELOG.md with changes

# 4. Package and test locally
npm run package
code --install-extension git-time-machine-0.0.1.vsix

# 5. Test thoroughly in VS Code

# 6. Publish to marketplaces
npm run publish:all

# 7. Verify on marketplace
# VS Code: https://marketplace.visualstudio.com/items?itemName=your-publisher-name.git-time-machine
# Open VSX: https://open-vsx.org/extension/your-publisher-name/git-time-machine
```

### Subsequent Releases

```bash
# 1. Make your changes

# 2. Test locally
npm run build
npm run package
code --install-extension git-time-machine-X.Y.Z.vsix

# 3. Update CHANGELOG.md

# 4. Bump version and push
npm run version:patch  # or minor/major

# 5. Publish
npm run publish:all
```

---

## 🔍 Verification

### After Publishing to VS Code Marketplace

1. Visit: `https://marketplace.visualstudio.com/items?itemName=your-publisher-name.git-time-machine`
2. Check:
   - [ ] Icon displays correctly
   - [ ] Description is accurate
   - [ ] Screenshots visible (if uploaded)
   - [ ] Version number is correct
   - [ ] Install button works

### After Publishing to Open VSX

1. Visit: `https://open-vsx.org/extension/your-publisher-name/git-time-machine`
2. Check same items as above

### Test Installation

```bash
# Uninstall if already installed
code --uninstall-extension your-publisher-name.git-time-machine

# Install from marketplace
code --install-extension your-publisher-name.git-time-machine

# Verify it works
```

---

## 📊 Package Size Optimization

### Check Package Contents

```bash
# List files in package
npx vsce ls

# Show package size
npx vsce package --no-dependencies
ls -lh *.vsix
```

### Optimize Size

The `.vscodeignore` file excludes:
- Source TypeScript files (only JS in out/)
- Development dependencies
- Test files
- Documentation sources
- Build artifacts

**Current exclusions:**
- ✅ src/ folder
- ✅ node_modules/
- ✅ Test files
- ✅ Source maps (optional, keep for debugging)
- ✅ Development docs (ARCHITECTURE.md, etc.)

**Recommended package size:**
- **Target**: < 5 MB
- **Acceptable**: < 10 MB
- **Warning**: > 10 MB

---

## 🐛 Troubleshooting

### "Error: Missing publisher name"

**Solution**: Update `publisher` field in package.json
```json
{
  "publisher": "your-publisher-name"
}
```

### "Error: Make sure to edit the README.md file"

**Solution**: Ensure README.md has substantial content (current one is good!)

### "Error: Personal Access Token is invalid"

**Solution**: 
1. Generate new PAT with Marketplace: Manage scope
2. Login again: `npx vsce login your-publisher-name`

### "OVSX token not found"

**Solution**: Set environment variable
```bash
export OVSX_TOKEN="your-token"
```

### "Extension already published with this version"

**Solution**: Bump version number
```bash
npm run version:patch
```

### Package too large

**Solution**:
1. Check what's included: `npx vsce ls`
2. Add excludes to `.vscodeignore`
3. Remove large unnecessary files

---

## 📈 Post-Publishing

### Monitor Analytics

**VS Code Marketplace:**
- View: Management Portal → Analytics
- Metrics: Installs, ratings, reviews

**Open VSX:**
- View: Extension page
- Metrics: Downloads

### Respond to Reviews

- Thank users for positive reviews
- Address issues in negative reviews
- Use feedback for improvements

### Update Extension

1. Fix bugs or add features
2. Update CHANGELOG.md
3. Bump version
4. Publish update

---

## 🔐 Security Best Practices

### Tokens

- ✅ Never commit tokens to git
- ✅ Use environment variables
- ✅ Rotate tokens every 90 days
- ✅ Keep tokens in password manager

### Code

- ✅ No hardcoded credentials
- ✅ Validate all user input
- ✅ Use official APIs only
- ✅ Keep dependencies updated

---

## 📞 Support

### VS Code Marketplace Issues

- Email: vscodeext@microsoft.com
- Docs: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

### Open VSX Issues

- GitHub: https://github.com/eclipse/openvsx
- Wiki: https://github.com/eclipse/openvsx/wiki

---

## 📚 Additional Resources

- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
- [Open VSX Documentation](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [VSCE CLI Reference](https://github.com/microsoft/vscode-vsce)

---

## 🎯 Quick Reference

```bash
# Development
npm install              # Install dependencies
npm run watch           # Watch mode
npm run build           # Compile and lint
npm run clean           # Clean artifacts

# Testing
npm run package         # Create .vsix
code --install-extension git-time-machine-X.Y.Z.vsix

# Publishing
npm run version:patch   # Bump version
npm run publish:vscode  # Publish to VS Code
npm run publish:openvsx # Publish to Open VSX
npm run publish:all     # Publish to both

# Verification
npx vsce ls            # List package contents
npx vsce show your-publisher-name.git-time-machine
```

---

**Ready to publish? Follow the checklist above! 🚀**

**Questions?** Open an issue on GitHub.

**Author**: DilZhan YaPa
**License**: MIT

