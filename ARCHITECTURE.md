# 🏗️ Git Time Machine - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VS Code IDE                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            Git Time Machine Extension                     │  │
│  │                                                           │  │
│  │  ┌──────────────┐    ┌──────────────┐   ┌─────────────┐ │  │
│  │  │  Extension   │────│  Tree View   │───│   VS Code   │ │  │
│  │  │   Entry      │    │   Provider   │   │     UI      │ │  │
│  │  │ (extension.ts)│    │              │   │   (SCM)     │ │  │
│  │  └──────┬───────┘    └──────┬───────┘   └─────────────┘ │  │
│  │         │                    │                           │  │
│  │         └────────┬───────────┘                           │  │
│  │                  │                                       │  │
│  │         ┌────────▼────────┐                             │  │
│  │         │   Git Service   │                             │  │
│  │         │  (gitService.ts) │                             │  │
│  │         │                 │                             │  │
│  │         │ • getCurrentBranch()                          │  │
│  │         │ • getRemoteBranch()                           │  │
│  │         │ • getUnpushedCommits() ◄── MAIN FEATURE      │  │
│  │         │ • editCommitMessage()                         │  │
│  │         │ • editCommitTimestamp()                       │  │
│  │         │ • isCommitSafeToEdit()                        │  │
│  │         └────────┬────────┘                             │  │
│  │                  │                                       │  │
│  └──────────────────┼───────────────────────────────────────┘  │
│                     │                                           │
│                     │ child_process.exec()                      │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │     Git CLI Commands   │
          │                       │
          │  • git rev-parse      │
          │  • git config         │
          │  • git fetch          │
          │  • git log            │
          │  • git commit --amend │
          │  • git status         │
          └───────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │   Local Git Repository│
          │                       │
          │  .git/                │
          │  ├── refs/            │
          │  ├── objects/         │
          │  └── config           │
          └───────────────────────┘
```

## Component Architecture

### 1. Extension Entry Point (`extension.ts`)

**Role**: Application lifecycle and command orchestration

```typescript
┌────────────────────────────────────┐
│        extension.activate()        │
├────────────────────────────────────┤
│                                    │
│  1. Initialize GitService          │
│  2. Create CommitTreeProvider      │
│  3. Register Commands:             │
│     • showUnpushedCommits          │
│     • editCommit                   │
│     • refreshView                  │
│  4. Setup File Watcher             │
│  5. Integrate with VS Code UI      │
│                                    │
└────────────────────────────────────┘
         │
         ├─► Command Handlers
         ├─► UI Event Handlers
         └─► File System Watcher
```

**Key Responsibilities**:
- Extension activation/deactivation
- Command registration
- User interaction handling
- Dialog creation (input boxes, quick picks)
- Error message display
- Success notifications

### 2. Git Service (`gitService.ts`)

**Role**: Git operations and business logic

```typescript
┌──────────────────────────────────────────┐
│           GitService                     │
├──────────────────────────────────────────┤
│                                          │
│  🔍 Detection Methods                    │
│  ├─ getCurrentBranch()                   │
│  ├─ getRemoteBranch()                    │
│  └─ getUnpushedCommits() ◄── CORE       │
│                                          │
│  ✏️ Edit Methods                         │
│  ├─ editCommitMessage()                  │
│  └─ editCommitTimestamp()                │
│                                          │
│  🛡️ Safety Methods                       │
│  ├─ isCommitSafeToEdit()                 │
│  └─ hasUncommittedChanges()              │
│                                          │
│  🔧 Helper Methods                       │
│  ├─ parseCommit()                        │
│  └─ remoteExists()                       │
│                                          │
└──────────────────────────────────────────┘
```

**Data Flow - Unpushed Commit Detection**:

```
Input: workspaceRoot
  │
  ▼
┌─────────────────────────────────┐
│  1. getCurrentBranch()          │
│     $ git rev-parse             │
│       --abbrev-ref HEAD         │
└──────────┬──────────────────────┘
           │ Returns: "main"
           ▼
┌─────────────────────────────────┐
│  2. getRemoteBranch()           │
│     $ git config --get          │
│       branch.main.remote        │
│     $ git config --get          │
│       branch.main.merge         │
└──────────┬──────────────────────┘
           │ Returns: "origin/main"
           ▼
┌─────────────────────────────────┐
│  3. Fetch Remote Data           │
│     $ git fetch                 │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  4. Get Unpushed Commits        │
│     $ git log origin/main..HEAD │
│       --format=%H|%an|%ae|%at|%s│
└──────────┬──────────────────────┘
           │ Returns: Raw commit data
           ▼
┌─────────────────────────────────┐
│  5. Parse Commit Data           │
│     parseCommit(line)           │
│     for each line               │
└──────────┬──────────────────────┘
           │ Returns: GitCommit[]
           ▼
┌─────────────────────────────────┐
│  Output: UnpushedCommitsResult  │
│  {                              │
│    commits: GitCommit[],        │
│    currentBranch: string,       │
│    remoteBranch: string | null, │
│    hasRemote: boolean           │
│  }                              │
└─────────────────────────────────┘
```

### 3. Tree View Provider (`commitTreeProvider.ts`)

**Role**: UI representation and data binding

```typescript
┌────────────────────────────────────────┐
│      CommitTreeProvider                │
│  (TreeDataProvider<CommitTreeItem>)    │
├────────────────────────────────────────┤
│                                        │
│  📊 Data Management                    │
│  ├─ getChildren()                      │
│  ├─ getTreeItem()                      │
│  └─ refresh()                          │
│                                        │
│  🔄 State                              │
│  ├─ _onDidChangeTreeData (emitter)    │
│  └─ unpushedResult (cached data)      │
│                                        │
│  🎨 UI Creation                        │
│  └─ Creates CommitTreeItem instances   │
│                                        │
└────────────────────────────────────────┘
              │
              │ Creates
              ▼
┌────────────────────────────────────────┐
│        CommitTreeItem                  │
│        (TreeItem)                      │
├────────────────────────────────────────┤
│                                        │
│  label: commit.message                 │
│  description: "abc1234 • Author • 2h"  │
│  tooltip: Full commit details          │
│  contextValue: "unpushedCommit"        │
│  iconPath: ThemeIcon('git-commit')     │
│                                        │
└────────────────────────────────────────┘
```

**UI Rendering Flow**:

```
User Opens SCM Panel
  │
  ▼
VS Code calls getChildren()
  │
  ▼
CommitTreeProvider.getChildren()
  ├─► Call GitService.getUnpushedCommits()
  │     │
  │     └─► Execute git commands
  │           │
  │           └─► Parse results
  │
  ▼
Create CommitTreeItem for each commit
  ├─► Set label (message)
  ├─► Set description (hash, author, time)
  ├─► Set tooltip (full details)
  └─► Set icon
  │
  ▼
Return CommitTreeItem[]
  │
  ▼
VS Code renders tree view
  │
  └─► User sees commits in UI
```

### 4. Type Definitions (`types.ts`)

**Role**: Type safety and data contracts

```typescript
┌───────────────────────────────────────┐
│          GitCommit                    │
├───────────────────────────────────────┤
│  hash: string                         │
│  shortHash: string                    │
│  message: string                      │
│  author: string                       │
│  authorEmail: string                  │
│  date: Date                           │
│  timestamp: number                    │
│  isPushed: boolean                    │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│    UnpushedCommitsResult              │
├───────────────────────────────────────┤
│  commits: GitCommit[]                 │
│  currentBranch: string                │
│  remoteBranch: string | null          │
│  hasRemote: boolean                   │
└───────────────────────────────────────┘
```

## User Interaction Flow

### Scenario: View Unpushed Commits

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ Opens SCM Panel (Ctrl+Shift+G)
     ▼
┌──────────────────┐
│   VS Code UI     │
└────┬─────────────┘
     │
     │ Loads Git Time Machine view
     ▼
┌─────────────────────┐
│  Tree View Provider │
└────┬────────────────┘
     │
     │ getChildren()
     ▼
┌──────────────────┐
│   Git Service    │
└────┬─────────────┘
     │
     │ getUnpushedCommits()
     ▼
┌──────────────────┐
│   Git CLI        │
│  (via exec)      │
└────┬─────────────┘
     │
     │ Returns commit data
     ▼
┌──────────────────┐
│   Git Service    │
│  Parse & format  │
└────┬─────────────┘
     │
     │ Returns GitCommit[]
     ▼
┌─────────────────────┐
│  Tree View Provider │
│  Create tree items  │
└────┬────────────────┘
     │
     │ Returns CommitTreeItem[]
     ▼
┌──────────────────┐
│   VS Code UI     │
│  Render commits  │
└────┬─────────────┘
     │
     │ Display
     ▼
┌──────────┐
│   User   │
│  Sees    │
│ Commits  │
└──────────┘
```

### Scenario: Edit Commit Message

```
User clicks ✏️ icon
  │
  ▼
Extension.editCommit(treeItem)
  │
  ├─► 1. Safety Check
  │   └─► GitService.isCommitSafeToEdit()
  │         │
  │         └─► Verify in unpushed list ✓
  │
  ├─► 2. Check Uncommitted Changes
  │   └─► GitService.hasUncommittedChanges()
  │         │
  │         └─► Show warning if dirty
  │
  ├─► 3. Show Options Dialog
  │   └─► vscode.window.showQuickPick()
  │         │
  │         └─► User selects "Edit Message"
  │
  ├─► 4. Get New Message
  │   └─► vscode.window.showInputBox()
  │         │
  │         └─► User enters new message
  │
  ├─► 5. Edit Commit
  │   └─► GitService.editCommitMessage()
  │         │
  │         └─► $ git commit --amend -m "..."
  │
  ├─► 6. Show Success
  │   └─► vscode.window.showInformationMessage()
  │
  └─► 7. Refresh View
      └─► CommitTreeProvider.refresh()
            │
            └─► UI updates
```

## Data Structures

### Git Commit Flow

```
Git Repository
  │
  │ git log output:
  │ abc123|John Doe|john@example.com|1699372800|Add feature
  │
  ▼
Parse (gitService.parseCommit)
  │
  ▼
GitCommit Object:
{
  hash: "abc1234567890abcdef1234567890abcdef123",
  shortHash: "abc1234",
  message: "Add feature",
  author: "John Doe",
  authorEmail: "john@example.com",
  date: Date(1699372800000),
  timestamp: 1699372800,
  isPushed: false
}
  │
  ▼
CommitTreeItem:
{
  label: "Add feature",
  description: "abc1234 • John Doe • 2 hours ago",
  tooltip: "Hash: abc1234...\nAuthor: John Doe...",
  contextValue: "unpushedCommit",
  iconPath: ThemeIcon('git-commit')
}
  │
  ▼
VS Code UI:
┌────────────────────────────────────────┐
│ abc1234 • John Doe • 2 hours ago  ✏️  │
│ "Add feature"                          │
└────────────────────────────────────────┘
```

## Command Flow

### Registered Commands

```
┌─────────────────────────────────────────────────┐
│  VS Code Command Palette                        │
└─────────────────────┬───────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌──────────┐ ┌──────────────┐
│    Show     │ │   Edit   │ │   Refresh    │
│  Unpushed   │ │  Commit  │ │     View     │
│  Commits    │ │          │ │              │
└─────┬───────┘ └────┬─────┘ └──────┬───────┘
      │              │                │
      │              │                │
      ▼              ▼                ▼
┌─────────────────────────────────────────────────┐
│         Extension Command Handlers              │
│                                                 │
│  • git-time-machine.showUnpushedCommits         │
│  • git-time-machine.editCommit                  │
│  • git-time-machine.refreshView                 │
│                                                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
      ┌───────────────────────┐
      │    GitService &       │
      │  CommitTreeProvider   │
      └───────────────────────┘
```

## File Watcher System

```
Git Repository Changes
  │
  │ (commit, checkout, push, etc.)
  │
  ▼
.git/ directory modified
  │
  ▼
┌────────────────────────────────┐
│  VS Code FileSystemWatcher     │
│  Pattern: **/.git/**           │
└──────────┬─────────────────────┘
           │
           │ onDidChange event
           │
           ▼
┌────────────────────────────────┐
│  CommitTreeProvider.refresh()  │
└──────────┬─────────────────────┘
           │
           │ Fire tree data change event
           │
           ▼
┌────────────────────────────────┐
│  VS Code UI                    │
│  Reload tree view              │
└────────────────────────────────┘
```

## Safety Architecture

### Multi-Layer Safety Checks

```
User Attempts Edit
  │
  ▼
┌────────────────────────────────┐
│  Layer 1: Context Validation   │
│  • Is it a valid commit?       │
│  • Is tree item valid?         │
└────────┬───────────────────────┘
         │ PASS
         ▼
┌────────────────────────────────┐
│  Layer 2: Push Status Check    │
│  • isCommitSafeToEdit()        │
│  • Verify in unpushed list     │
└────────┬───────────────────────┘
         │ PASS
         ▼
┌────────────────────────────────┐
│  Layer 3: Working Tree Check   │
│  • hasUncommittedChanges()     │
│  • Warn if dirty               │
└────────┬───────────────────────┘
         │ PROCEED or ABORT
         ▼
┌────────────────────────────────┐
│  Layer 4: Input Validation     │
│  • Non-empty message           │
│  • Valid date format           │
└────────┬───────────────────────┘
         │ PASS
         ▼
┌────────────────────────────────┐
│  Layer 5: User Confirmation    │
│  • Show dialog                 │
│  • Allow cancel                │
└────────┬───────────────────────┘
         │ CONFIRMED
         ▼
┌────────────────────────────────┐
│  Execute Git Command           │
│  • git commit --amend          │
└────────┬───────────────────────┘
         │ SUCCESS
         ▼
┌────────────────────────────────┐
│  Refresh & Notify              │
└────────────────────────────────┘
```

## Performance Optimizations

1. **Lazy Loading**
   - Commits loaded only when view is opened
   - Incremental updates on changes

2. **Efficient Git Commands**
   - Single command for all commit data
   - Custom format to reduce parsing

3. **Caching**
   - Tree provider caches unpushed result
   - Only refreshes on actual git changes

4. **Async/Await**
   - Non-blocking operations
   - Responsive UI

## Error Handling

```
Git Command Execution
  │
  ├─► Success Path
  │   └─► Return data
  │
  └─► Error Path
      │
      ├─► Try/Catch Block
      │   │
      │   ├─► Console.error() (debug)
      │   │
      │   ├─► vscode.window.showErrorMessage() (user)
      │   │
      │   └─► Return safe fallback
      │
      └─► Graceful Degradation
          ├─► Empty commit list
          ├─► Null values
          └─► Continue execution
```

## Deployment Architecture

```
Source Code (TypeScript)
  │
  │ npm run compile
  ▼
Compiled Code (JavaScript)
  │
  │ vsce package
  ▼
Extension Package (.vsix)
  │
  │ Install in VS Code
  ▼
Running Extension
  │
  ├─► Activated on:
  │   • Workspace with git repo
  │   • Command execution
  │
  └─► Deactivated on:
      • VS Code close
      • Extension disable
```

---

**Architecture Status**: ✅ Complete & Well-Structured

**Key Principles**:
- 🔧 **Modularity**: Clear separation of concerns
- 🛡️ **Safety**: Multiple validation layers
- ⚡ **Performance**: Efficient and responsive
- 🎯 **Simplicity**: Clean, understandable code
- 📖 **Maintainability**: Well-documented and typed

