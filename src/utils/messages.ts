/**
 * User-facing messages and notifications
 * Centralized for consistency and easy localization
 */

export const Messages = {
  // Success messages
  SUCCESS: {
    COMMIT_EDITED: (hash: string) => `✅ Successfully edited commit ${hash}`,
    COMMITS_EDITED: (count: number) => `✅ Successfully edited ${count} commit${count > 1 ? 's' : ''}!`,
    BACKUP_CREATED: (branch: string) => `✅ Created backup branch: ${branch}`,
    RESTORED: (branch: string) => `✅ Successfully restored from ${branch}`,
    REFRESHED: 'Git Time Machine: Refreshed',
  },

  // Info messages
  INFO: {
    NO_UNPUSHED: (branch: string) => `No unpushed commits on branch '${branch}'`,
    UNPUSHED_COUNT: (count: number, branch: string) => 
      `Found ${count} unpushed commit${count > 1 ? 's' : ''} on '${branch}'`,
    NO_BACKUP_FOUND: 'No backup branches found',
    NO_CHANGES: 'No changes to apply',
    CANCELLED: 'Operation cancelled',
  },

  // Warning messages
  WARNING: {
    UNCOMMITTED_CHANGES: 'You have uncommitted changes. It\'s recommended to commit or stash them first. Continue anyway?',
    COMMIT_ON_REMOTE: (hash: string) => `⚠️ Warning: Commit ${hash} exists on remote! Cannot edit safely.`,
    REWRITING_HISTORY: (count: number) => 
      `This will rewrite git history for ${count} commit${count > 1 ? 's' : ''}. A backup branch has been created. Continue?`,
    NO_GIT_REPO: 'Not a git repository. Please open a folder containing a git repository.',
    DETACHED_HEAD: 'You are in detached HEAD state. Please checkout a branch first.',
  },

  // Error messages
  ERROR: {
    NO_WORKSPACE: 'Git Time Machine: No workspace folder open',
    NO_BRANCH: 'Could not determine current branch',
    NO_COMMIT_SELECTED: 'No commit selected',
    EMPTY_MESSAGE: 'Commit message cannot be empty',
    INVALID_DATE: 'Invalid date format',
    GIT_COMMAND_FAILED: (command: string, error: string) => `Git command failed: ${command}\n${error}`,
    EDIT_FAILED: (reason: string) => `Failed to edit commit: ${reason}`,
    UNDO_FAILED: (reason: string) => `Failed to undo: ${reason}`,
    WORKING_TREE_DIRTY: 'Working tree has uncommitted changes. Please commit or stash them first.',
  },

  // Confirmation prompts
  CONFIRM: {
    EDIT_WITH_CHANGES: 'Continue editing with uncommitted changes?',
    RESTORE_BACKUP: (branch: string) => `This will reset to backup branch: ${branch}. Continue?`,
    APPLY_CHANGES: 'Confirm and Apply Changes',
  },

  // Progress messages
  PROGRESS: {
    SCANNING: 'Scanning unpushed commits...',
    CREATING_BACKUP: 'Creating backup branch...',
    APPLYING_CHANGES: 'Applying changes...',
    PROCESSING: (current: number, total: number) => `Processing ${current}/${total}...`,
    REWRITING_HISTORY: 'Rewriting history...',
  },

  // Tooltips
  TOOLTIP: {
    COMMIT_HASH: (hash: string, message: string) => `Hash: ${hash}\nMessage: ${message}`,
    EDIT_BUTTON: 'Edit this commit\'s message and/or timestamp',
    REFRESH_BUTTON: 'Refresh unpushed commits list',
    BACKUP_BRANCH: 'Backup branch created before editing. Use "Undo" command to restore.',
    SYNC_DATES: 'Set commit date to match author date (recommended in most cases)',
  },

  // Help text
  HELP: {
    NO_REMOTE: 'This branch has no remote tracking branch. All commits are considered unpushed.',
    AUTHOR_VS_COMMIT_DATE: 'Author Date: When commit was originally created.\nCommit Date: When commit was last modified (e.g., via amend).',
    SAFETY_FIRST: 'Git Time Machine only allows editing unpushed commits to ensure safe history management.',
  },
};

export const ButtonLabels = {
  YES: 'Yes',
  NO: 'No',
  CONTINUE: 'Continue',
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',
  ABORT: 'Abort',
  YES_UNDO: 'Yes, Undo',
  EDIT_MESSAGE: '✏️ Yes, edit message',
  SKIP_MESSAGE: '⏭️ No, keep current message',
  EDIT_TIMESTAMP: '📅 Yes, edit timestamp',
  SKIP_TIMESTAMP: '⏭️ No, keep current timestamp',
};

