# Git Time Machine Plus ⏰

<p align="center">
  <img src="media/icon.png" alt="Git Time Machine Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Professional Git history management for VS Code</strong><br>
  <em>Safely edit commit messages and timestamps before pushing</em>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=DilZhanYapa.git-time-machine">
    <img src="https://img.shields.io/visual-studio-marketplace/v/DilZhanYapa.git-time-machine?color=007ACC&label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="VS Code Marketplace">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=DilZhanYapa.git-time-machine">
    <img src="https://img.shields.io/visual-studio-marketplace/d/DilZhanYapa.git-time-machine?color=4EC9B0&logo=visual-studio-code" alt="Downloads">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=DilZhanYapa.git-time-machine">
    <img src="https://img.shields.io/visual-studio-marketplace/r/DilZhanYapa.git-time-machine?color=4EC9B0&logo=visual-studio-code" alt="Rating">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <img src="https://img.shields.io/badge/version-1.0.0-brightgreen.svg" alt="Version 1.0.0">
</p>

---

## 📖 What is Git Time Machine Plus?

**Git Time Machine Plus** is a production-ready VS Code extension that provides professional-grade tools for managing your Git commit history. It allows you to **safely edit commit messages and timestamps** for unpushed commits with an intuitive, dual-view interface inspired by GitLens.

Perfect for developers who want to maintain a clean, professional commit history before pushing to remote repositories.

### 🎯 Why Choose Git Time Machine Plus?

- 🛡️ **Safety First**: Enterprise-grade safety checks - only edits unpushed commits
- 🎨 **Dual View Interface**: Sidebar tree view + bottom panel (like GitLens)
- 🚀 **Production Ready**: Stable v1.0.0 release with SOLID architecture
- 🔍 **Smart Detection**: Automatically identifies unpushed commits
- ✨ **Modern UI**: Beautiful webview with VSCode Webview UI Toolkit
- 📦 **Bulk Operations**: Edit multiple commits efficiently
- 📅 **Native Date Picker**: Integrated datetime picker matching VSCode theme
- 💾 **Automatic Backups**: Safety net with automatic backup branches
- ↩️ **One-Click Undo**: Restore from backup instantly
- 🌓 **Theme Aware**: Seamlessly matches VSCode dark and light themes
- ⚡ **Live Updates**: Real-time synchronization across all views

---

## 🎬 Demo

> **Note**: Screenshots and demo GIF coming soon! The extension is fully functional and production-ready.

### Available Views

**1. Sidebar Tree View** - Quick access in Source Control panel  
**2. Bottom Panel View** - Full-featured panel alongside Problems, Output, Terminal  
**3. Visual Date/Time Picker** - Native datetime input with VSCode theme integration  
**4. Bulk Edit Summary** - Review all changes before applying

<!--
![Demo GIF](media/demo.gif)
![Sidebar View](media/screenshots/sidebar-view.png)
![Bottom Panel View](media/screenshots/bottom-panel.png)
![Date Picker](media/screenshots/date-picker.png)
![Summary View](media/screenshots/summary.png)
-->

---

## ✨ Features

### 🔍 Automatic Unpushed Commit Detection

- Automatically detects commits that haven't been pushed to remote
- Displays them in a dedicated tree view in the Source Control panel
- Shows commit hash, author, message, and relative time
- Works with branches that have remote tracking or standalone branches

### ✏️ Edit Commit Messages

- Edit commit messages with a simple input box
- Validation to prevent empty messages
- Works for HEAD and older commits

### 📅 Edit Commit Timestamps

- Visual date/time picker with calendar interface
- Separate controls for Author Date and Commit Date
- Sync button to match dates easily
- Supports multiple date formats

### 📦 Bulk Edit Multiple Commits

- Select multiple commits using multi-select QuickPick
- Edit each commit's message and timestamp in sequence
- Beautiful summary table before applying changes
- Progress indicators during processing

### 🛡️ Safety Features

- **Remote Check**: Automatically verifies commits aren't on remote
- **Backup Branch**: Creates backup branch before any changes
- **Undo Command**: Restore from backup with one command
- **Working Tree Check**: Warns about uncommitted changes
- **Confirmation Dialogs**: Always confirms before making changes

### 🎨 Beautiful UI

- Modern Tailwind CSS styling
- Smooth fade and slide animations
- Responsive design
- Dark and light theme support
- Heroicons integration
- Progress animations

### 📊 Tree View Integration

- Integrated into VS Code's Source Control panel
- Shows all unpushed commits at a glance
- Inline edit buttons for quick access
- Auto-refresh on git changes
- Tooltips with full commit details

---

## 📦 Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for **"Git Time Machine"**
4. Click **Install**
5. Reload VS Code if prompted

### From VSIX File

1. Download the `.vsix` file from releases
2. Open VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Extensions: Install from VSIX"
5. Select the downloaded `.vsix` file

### From Source

```bash
git clone https://github.com/DilZhaan/git-time-machine.git
cd git-time-machine
npm install
npm run compile
# Press F5 to launch Extension Development Host
```

---

## 🚀 Usage

### Quick Start

1. **Open a git repository** in VS Code
2. **Open Source Control** panel (`Ctrl+Shift+G` / `Cmd+Shift+G`)
3. **Find "Git Time Machine"** section - your unpushed commits are listed
4. **Choose your workflow** below based on your needs

---

### Method 1: Sidebar Tree View (Quick Access)

**Best for:** Quick edits, checking unpushed commits at a glance

1. Open the **Source Control** panel
2. Locate the **"Git Time Machine"** section
3. Click the **✏️ edit icon** next to any commit
4. Choose what to edit (message, timestamp, or both)
5. Make your changes and confirm

**Features:**

- ✅ Always visible in Source Control
- ✅ One-click access to any commit
- ✅ Refresh button to rescan
- ✅ Tooltips with full commit details

---

### Method 2: Bottom Panel View (Immersive Experience)

**Best for:** Detailed work, bulk operations, comparing commits

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type: **"Git Time Machine: Open Panel View"**
3. The panel opens at the bottom (like Problems, Output, Terminal)
4. Browse, filter, and edit commits with full interface
5. Panel stays in sync with sidebar view

**Features:**

- ✅ More screen space for commit details
- ✅ Search and filter capabilities
- ✅ Side-by-side with other panels
- ✅ Full commit editing interface
- ✅ Live refresh on git changes

**Tip:** You can use both sidebar and bottom panel views simultaneously!

---

### Method 3: Single Commit Edit (Full Flow)

**Best for:** Guided workflow for editing one commit

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: **"Git Time Machine: Edit Commit (Full Flow)"**
3. Select a commit from the list
4. Choose to edit message and/or timestamp
5. Use the integrated datetime picker if editing dates
6. Review the summary and confirm

**Safety Steps:**

1. ✅ Automatic safety checks
2. ✅ Backup branch creation
3. ✅ Preview of all changes
4. ✅ Final confirmation dialog

---

### Method 4: Bulk Edit Multiple Commits

**Best for:** Cleaning up multiple commits before push

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: **"Git Time Machine: Bulk Edit Multiple Commits"**
3. **Multi-select commits** using space bar (⬚ → ☑)
4. For each selected commit:
   - Choose whether to edit message
   - Choose whether to edit timestamp
   - Make your changes
5. Review the **Summary Table** with all changes
6. Confirm to apply all edits atomically

**Progress Tracking:**

- 📊 Shows "Editing commit X of Y"
- ⚙️ Progress bar during processing
- ✅ Success confirmation with undo option

---

### Undo Changes (Safety Net)

**If you need to revert your changes:**

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: **"Git Time Machine: Undo Changes"**
3. Select the backup branch (auto-created during edit)
4. Confirm restoration

**Note:** Backup branches are named: `<branch>-gittimemachine-<timestamp>`

---

### Refresh Commits

**To rescan for unpushed commits:**

1. Click the **refresh icon** (🔄) in the sidebar view, OR
2. Use Command Palette: **"Git Time Machine: Refresh"**

**Auto-refresh:** The extension automatically refreshes when:

- Files change in the repository
- Git operations complete
- Branch switches occur

---

## 🎹 Commands

| Command                                           | Description                                | Keyboard Shortcut |
| ------------------------------------------------- | ------------------------------------------ | ----------------- |
| `Git Time Machine: Show Unpushed Commits`         | Display all unpushed commits in sidebar    | -                 |
| `Git Time Machine: Open Panel View`               | Open bottom panel view (NEW)               | -                 |
| `Git Time Machine: Refresh Panel View`            | Refresh bottom panel (NEW)                 | -                 |
| `Git Time Machine: Edit Commit`                   | Quick edit from tree view                  | -                 |
| `Git Time Machine: Edit Commit (Full Flow)`       | Complete guided flow with date/time picker | -                 |
| `Git Time Machine: Bulk Edit Multiple Commits`    | Edit multiple commits at once              | -                 |
| `Git Time Machine: Undo Changes (Restore Backup)` | Restore from backup branch                 | -                 |
| `Git Time Machine: Refresh`                       | Reload the unpushed commits list           | -                 |

### Custom Keyboard Shortcuts

You can add custom keyboard shortcuts in VS Code:

1. Press `Ctrl+K Ctrl+S` (or `Cmd+K Cmd+S` on Mac)
2. Search for "Git Time Machine"
3. Click the **+** icon to add a keybinding

**Suggested shortcuts:**

```json
{
  "key": "ctrl+alt+g t",
  "command": "git-time-machine.showUnpushedCommits",
  "when": "!inDebugMode"
},
{
  "key": "ctrl+alt+g p",
  "command": "git-time-machine.openPanelView",
  "when": "!inDebugMode"
},
{
  "key": "ctrl+alt+g e",
  "command": "git-time-machine.bulkEdit",
  "when": "!inDebugMode"
}
```

---

## 📋 Requirements

- **VS Code**: 1.85.0 or higher
- **Git**: Installed and available in PATH
- **Internet**: Required for Tailwind CSS and flatpickr CDN (webview only)
- **Repository**: A git repository with commits

---

## 🛡️ Safety & Security

### What Git Time Machine Does

✅ **Scans** unpushed commits safely  
✅ **Creates** automatic backups before any changes  
✅ **Validates** that commits haven't been pushed  
✅ **Warns** about uncommitted changes  
✅ **Confirms** before making any modifications

### What Git Time Machine CANNOT Do

❌ **Edit pushed commits** (blocked by safety checks)  
❌ **Delete commits** (not supported)  
❌ **Modify commit content** (only metadata)  
❌ **Force push** (you control that)

### How It Works

```
1. Scan → git log <remote>..HEAD
2. Safety Check → git branch -r --contains <commit>
3. Backup → git branch <branch>-gittimemachine-<timestamp>
4. Edit → git commit --amend (for HEAD) or rebase (for older)
5. Undo → git reset --hard <backup-branch>
```

### Best Practices

1. ✅ Always work on unpushed commits only
2. ✅ Review the summary before confirming changes
3. ✅ Keep backup branches until you're satisfied
4. ✅ Commit or stash your working changes first
5. ✅ Use meaningful commit messages

---

## ❓ FAQ

### Q: Can I edit commits that have already been pushed?

**A:** No. Git Time Machine blocks this for safety. Editing pushed commits would rewrite shared history and cause issues for collaborators.

### Q: What happens if I make a mistake?

**A:** Every edit creates a backup branch (e.g., `main-gittimemachine-1699376400000`). Use the **Undo** command to restore from any backup.

### Q: Does this work with branches that don't have a remote?

**A:** Yes! If a branch has no remote, all commits are considered "unpushed" and can be edited.

### Q: Can I edit multiple commits at once?

**A:** Yes! Use the **Bulk Edit** command to select and edit multiple commits in one flow.

### Q: Will this affect my collaborators?

**A:** Only if you force push after editing. As long as you edit unpushed commits, there's no impact.

### Q: What's the difference between Author Date and Commit Date?

**A:**

- **Author Date**: When the commit was originally created
- **Commit Date**: When the commit was last modified (e.g., via amend)

In most cases, they're the same. In v1.0.0+, both dates are synced automatically.

### Q: Does this require internet access?

**A:** No! Version 1.0.0+ works **completely offline**:

- ✅ All UI assets are bundled (VSCode Webview UI Toolkit)
- ✅ Remote branch checking uses **local git data** (your local copy of remote branches)
- ✅ The extension attempts `git fetch` but works fine if offline
- ⚠️ **Note**: For the most accurate "unpushed" detection, do a `git fetch` when online

**How it works offline:**

- Git stores remote branch info locally after each fetch
- The extension compares against this local copy: `git log origin/main..HEAD`
- No network requests are made by the extension itself

### Q: Can I use this in a CI/CD pipeline?

**A:** Git Time Machine is designed for interactive use in VS Code. For automation, use git commands directly.

### Q: How do I delete a backup branch?

**A:** Use git commands: `git branch -D <backup-branch-name>` or the VS Code source control UI.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check if the issue already exists in [Issues](https://github.com/DilZhaan/git-time-machine/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - VS Code version, Git version, OS
   - Screenshots if applicable

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and use case
3. Explain why it would be valuable

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write or update tests if applicable
5. Follow the existing code style
6. Commit with clear messages: `git commit -m "Add amazing feature"`
7. Push to your fork: `git push origin feature/amazing-feature`
8. Open a Pull Request with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots/GIFs if UI changes

### Development Setup

```bash
# Clone the repo
git clone https://github.com/DilZhaan/git-time-machine.git
cd git-time-machine

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch

# Launch Extension Development Host
# Press F5 in VS Code

# Run tests
npm test

# Lint code
npm run lint

# Package extension
npm run package
```

### Code Style

- Use TypeScript with strict mode
- Follow ESLint rules
- Add JSDoc comments for public methods
- Use meaningful variable names
- Keep functions focused and small

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

### [0.0.1] - 2025-11-07

#### Added

- Initial release
- Unpushed commit detection
- Single commit editing (message and timestamp)
- Bulk edit multiple commits
- Visual date/time picker with flatpickr
- Backup branch creation
- Undo functionality
- Tree view integration in Source Control panel
- Beautiful webview UI with Tailwind CSS
- Smooth animations and transitions
- Dark and light theme support
- Safety checks for remote commits
- Progress indicators
- Summary table for bulk edits

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright (c) 2025 DilZhan YaPa

---

## 🙏 Acknowledgments

- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- UI powered by [Tailwind CSS](https://tailwindcss.com/)
- Date picker by [flatpickr](https://flatpickr.js.org/)
- Icons from [Heroicons](https://heroicons.com/)
- Inspired by the need for safer git history management

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/DilZhaan/git-time-machine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DilZhaan/git-time-machine/discussions)
- **Email**: dilzhanyapa@gmail.com

---

## 🌟 Star the Project

If you find Git Time Machine useful, please consider giving it a star on GitHub! It helps others discover the project.

<p align="center">
  <a href="https://github.com/DilZhaan/git-time-machine">
    <img src="https://img.shields.io/github/stars/DilZhaan/git-time-machine?style=social" alt="GitHub Stars">
  </a>
</p>

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/DilZhaan">DilZhan YaPa</a>
</p>

<p align="center">
  <sub>⏰ Time travel through your git history, safely.</sub>
</p>
