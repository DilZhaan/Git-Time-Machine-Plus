# Changelog

All notable changes to the "Git Time Machine" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🎨 **Bottom Panel View**: New webview panel in the bottom panel area (like Problems, Output, Terminal)
  - Same rich UI as sidebar with commit editing capabilities
  - Search, filter, and bulk edit commits
  - Visual date picker with flatpickr integration
  - Live refresh on git changes
  - Can be used alongside the sidebar tree view
- 🔗 **Dual View Support**: Switch between sidebar and bottom panel views
  - Button in sidebar to open bottom panel
  - Both views stay in sync automatically
  - GitLens-style multi-view approach
- 📦 **New Commands**:
  - `git-time-machine.openPanelView`: Open the bottom panel view
  - `git-time-machine.refreshPanelView`: Refresh the bottom panel

### Planned Features
- Support for editing non-HEAD commits via interactive rebase
- Commit message templates
- History visualization
- Integration with GitHub/GitLab APIs
- Commit message linting
- Bulk operations on filtered commits
- Export/import commit history

## [0.0.1] - 2025-11-07

### Added
- 🎉 **Initial Release** of Git Time Machine
- 🔍 **Unpushed Commit Detection**: Automatically detect commits that haven't been pushed to remote
- ✏️ **Single Commit Editing**: Edit individual commit messages and timestamps
- 📦 **Bulk Edit Mode**: Select and edit multiple commits at once
- 📅 **Visual Date/Time Picker**: Beautiful webview with flatpickr integration
- 🎨 **Modern UI**: Tailwind CSS styling with smooth animations
- 🌓 **Theme Support**: Automatic dark and light theme detection
- 🛡️ **Safety Features**:
  - Automatic backup branch creation
  - Remote commit verification
  - Working tree validation
  - Confirmation dialogs
- 📊 **Tree View Integration**: Dedicated panel in Source Control sidebar
- ⚡ **Real-time Updates**: File watcher for automatic refresh
- 🔄 **Undo Functionality**: Restore from backup branches
- 📋 **Summary View**: Preview all changes before applying
- 🎯 **Progress Indicators**: Visual feedback during operations
- 💾 **Multiple Commands**:
  - Show Unpushed Commits
  - Edit Commit (Quick)
  - Edit Commit (Full Flow with Webview)
  - Bulk Edit Multiple Commits
  - Undo Changes (Restore Backup)
  - Refresh View

### Features in Detail

#### Commit Detection
- Scans current branch for unpushed commits
- Compares with remote tracking branch
- Handles branches without remotes
- Shows commit hash, author, date, and message
- Relative time display (e.g., "2 hours ago")

#### Edit Capabilities
- **Messages**: Full validation, prevents empty messages
- **Timestamps**: Separate author and commit dates
- **Sync Button**: Keep dates matched easily
- **Multiple Formats**: ISO 8601, RFC 2822, custom formats

#### User Interface
- **Webview Components**:
  - Date/time picker with calendar
  - Summary table with statistics
  - Progress animation
  - Success/error notifications
- **Animations**:
  - Fade-in effects
  - Slide transitions
  - Hover effects
  - Loading spinners
- **Icons**: Heroicons integration throughout
- **Responsive**: Works on all VS Code window sizes

#### Safety Mechanisms
- Verifies commits aren't on remote before editing
- Creates backup branch: `<branch>-gittimemachine-<timestamp>`
- Warns about uncommitted changes
- Requires explicit confirmation for all operations
- Only allows editing HEAD commits (for now)

#### Performance
- Lazy loading of commit data
- Efficient git command usage
- Incremental UI updates
- File watcher for automatic refresh
- No unnecessary re-renders

### Technical Details
- **Language**: TypeScript with strict mode
- **Framework**: VS Code Extension API 1.85.0+
- **UI Libraries**: 
  - Tailwind CSS 3.x (via CDN)
  - flatpickr 4.x (via CDN)
- **Build Tool**: TypeScript Compiler
- **Package Manager**: npm
- **Total Code**: ~2,300 lines of TypeScript

### Known Limitations
- Only HEAD commits fully supported for editing (non-HEAD requires interactive rebase)
- Requires internet connection for webview UI (CDN resources)
- No offline mode for visual picker
- Cannot edit already pushed commits (by design)

### Dependencies
- VS Code API: ^1.85.0
- Node.js built-in modules: child_process, util
- Dev Dependencies:
  - TypeScript: ^5.3.3
  - ESLint: ^8.56.0
  - @types/vscode: ^1.85.0
  - @types/node: ^20.x

### Documentation
- Comprehensive README with usage examples
- FAQ section covering common questions
- Contributing guidelines
- MIT License
- Brand assets (icons, banners)
- Media folder with branding

### Branding
- Professional logo design
- Icon variations: dark/light themes
- Banner images: 1280x640
- Square icons: 512x512
- SVG source files included
- Complete brand guidelines

## [0.0.2] - TBD

### Planned
- Video demo/animated GIF
- More keyboard shortcuts
- Settings/preferences panel
- Commit message templates
- Better error messages
- Unit tests
- Integration tests

## Notes

### Version Numbering
- **Major.Minor.Patch** (Semantic Versioning)
- **Major**: Breaking changes
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes, minor improvements

### Release Process
1. Update version in `package.json`
2. Update this CHANGELOG
3. Create git tag: `git tag -a v0.0.1 -m "Release v0.0.1"`
4. Push tag: `git push origin v0.0.1`
5. Package extension: `npm run package`
6. Publish: `npm run publish`

---

**Legend**:
- 🎉 Major feature
- ✨ Enhancement
- 🐛 Bug fix
- 🔒 Security
- 📝 Documentation
- ⚡ Performance
- 🎨 UI/UX
- ♻️ Refactor
- 🗑️ Deprecation
- 🚨 Breaking change

