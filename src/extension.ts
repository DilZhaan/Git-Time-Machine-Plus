import * as vscode from 'vscode';
import { GitService } from './git/gitService';
import { CommitTreeProvider } from './views/commitTreeProvider';
import { CommitPanelView } from './views/commitPanel';
import { EditCommitCommand } from './commands/editCommit';
import { BulkEditCommitsCommand } from './commands/bulkEditCommits';
import { Git } from './lib/git';
import { Telemetry } from './utils/telemetry';
import { ErrorHandler, Validator } from './utils/errorHandler';
import { Messages } from './utils/messages';

/**
 * Get the workspace root path
 */
function getWorkspaceRoot(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }
  return workspaceFolders[0].uri.fsPath;
}

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Git Time Machine extension is now active');
  
  // Track activation
  Telemetry.trackFeatureUsage(Telemetry.Events.EXTENSION_ACTIVATED);
  
  // Prompt for telemetry (only once)
  setTimeout(() => Telemetry.promptForTelemetry(), 5000);

  const workspaceRoot = Validator.validateWorkspace();

  if (!workspaceRoot) {
    vscode.window.showErrorMessage(Messages.ERROR.NO_WORKSPACE);
    return;
  }

  // Initialize services
  const gitService = new GitService(workspaceRoot);
  const commitTreeProvider = new CommitTreeProvider(gitService);

  // Register tree view (sidebar)
  const treeView = vscode.window.createTreeView('gitTimeMachine', {
    treeDataProvider: commitTreeProvider,
    showCollapseAll: false,
  });

  context.subscriptions.push(treeView);

  // Register webview panel view (bottom panel)
  const commitPanelView = new CommitPanelView(
    context.extensionUri,
    gitService
  );
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'gitTimeMachinePanelView',
      commitPanelView,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  // Register command: Show unpushed commits
  const showUnpushedCommand = vscode.commands.registerCommand(
    'git-time-machine.showUnpushedCommits',
    async () => {
      try {
        const result = await gitService.getUnpushedCommits();

        if (result.commits.length === 0) {
          vscode.window.showInformationMessage(
            `No unpushed commits on branch '${result.currentBranch}'`
          );
        } else {
          const remoteBranchInfo = result.hasRemote
            ? ` (ahead of ${result.remoteBranch})`
            : ' (no remote tracking branch)';

          vscode.window.showInformationMessage(
            `Found ${result.commits.length} unpushed commit(s) on '${result.currentBranch}'${remoteBranchInfo}`
          );

          // Show the tree view
          vscode.commands.executeCommand('gitTimeMachine.focus');
        }

        commitTreeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
      }
    }
  );

  // Register command: Refresh view
  const refreshCommand = vscode.commands.registerCommand(
    'git-time-machine.refreshView',
    () => {
      commitTreeProvider.refresh();
      vscode.window.showInformationMessage('Git Time Machine: Refreshed');
    }
  );

  // Register command: Edit commit
  const editCommitCommand = vscode.commands.registerCommand(
    'git-time-machine.editCommit',
    async (commitTreeItem) => {
      console.log('Edit commit called with:', commitTreeItem);
      
      let commit: any;
      
      // If no commit provided (called from Command Palette), show a picker
      if (!commitTreeItem || !commitTreeItem.commit) {
        const unpushedResult = await gitService.getUnpushedCommits();
        
        if (unpushedResult.commits.length === 0) {
          vscode.window.showInformationMessage('No unpushed commits found');
          return;
        }
        
        const selected = await vscode.window.showQuickPick(
          unpushedResult.commits.map(c => ({
            label: `$(git-commit) ${c.message}`,
            description: `${c.shortHash} • ${c.author}`,
            commit: c
          })),
          { placeHolder: 'Select a commit to edit' }
        );
        
        if (!selected) {
          return;
        }
        
        commit = selected.commit;
      } else {
        commit = commitTreeItem.commit;
      }

      // Verify commit is safe to edit
      const isSafe = await gitService.isCommitSafeToEdit(commit.hash);
      if (!isSafe) {
        vscode.window.showErrorMessage(
          'This commit has been pushed and cannot be safely edited.'
        );
        return;
      }

      // Check for uncommitted changes
      const hasChanges = await gitService.hasUncommittedChanges();
      if (hasChanges) {
        const proceed = await vscode.window.showWarningMessage(
          'You have uncommitted changes. Editing commits may cause issues. Continue?',
          'Yes',
          'No'
        );
        if (proceed !== 'Yes') {
          return;
        }
      }

      // Show edit options
      const editOption = await vscode.window.showQuickPick(
        [
          { label: '$(edit) Edit Message', value: 'message' },
          { label: '$(calendar) Edit Timestamp', value: 'timestamp' },
          { label: '$(symbol-event) Edit Both', value: 'both' },
        ],
        { placeHolder: 'What would you like to edit?' }
      );

      if (!editOption) {
        return;
      }

      try {
        if (editOption.value === 'message' || editOption.value === 'both') {
          const newMessage = await vscode.window.showInputBox({
            prompt: 'Enter new commit message',
            value: commit.message,
            validateInput: (value) => {
              if (!value || value.trim().length === 0) {
                return 'Commit message cannot be empty';
              }
              return null;
            },
          });

          if (newMessage) {
            await gitService.editCommitMessage(commit.hash, newMessage);
            vscode.window.showInformationMessage('Commit message updated successfully');
          }
        }

        if (editOption.value === 'timestamp' || editOption.value === 'both') {
          const dateInput = await vscode.window.showInputBox({
            prompt: 'Enter new date and time (YYYY-MM-DD HH:MM:SS or ISO format)',
            value: commit.date.toISOString().replace('T', ' ').substring(0, 19),
            validateInput: (value) => {
              try {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                  return 'Invalid date format';
                }
                return null;
              } catch {
                return 'Invalid date format';
              }
            },
          });

          if (dateInput) {
            const newDate = new Date(dateInput);
            await gitService.editCommitTimestamp(commit.hash, newDate);
            vscode.window.showInformationMessage('Commit timestamp updated successfully');
          }
        }

        // Refresh the view
        commitTreeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Error editing commit: ${error}`);
      }
    }
  );

  // Register command: Edit commit with full flow (webview)
  const editCommitFullCommand = vscode.commands.registerCommand(
    'git-time-machine.editCommitFull',
    async () => {
      const editCmd = new EditCommitCommand(context, workspaceRoot);
      try {
        await editCmd.execute();
        commitTreeProvider.refresh();
      } finally {
        editCmd.dispose();
      }
    }
  );

  // Register command: Bulk edit multiple commits
  const bulkEditCommand = vscode.commands.registerCommand(
    'git-time-machine.bulkEdit',
    async () => {
      const bulkEditCmd = new BulkEditCommitsCommand(context, workspaceRoot);
      try {
        await bulkEditCmd.execute();
        commitTreeProvider.refresh();
      } finally {
        bulkEditCmd.dispose();
      }
    }
  );

  // Register command: Open panel view
  const openPanelViewCommand = vscode.commands.registerCommand(
    'git-time-machine.openPanelView',
    async () => {
      await vscode.commands.executeCommand('gitTimeMachinePanelView.focus');
    }
  );

  // Register command: Refresh panel view
  const refreshPanelViewCommand = vscode.commands.registerCommand(
    'git-time-machine.refreshPanelView',
    async () => {
      await commitPanelView.refresh();
    }
  );

  // Register command: Undo changes (checkout backup branch)
  let lastBulkEditCommand: BulkEditCommitsCommand | null = null;
  const undoCommand = vscode.commands.registerCommand(
    'git-time-machine.undo',
    async () => {
      // Find backup branches
      const git = new Git(workspaceRoot);
      const branches = await git.getAllBranches();
      const backupBranches = branches.filter(b => b.includes('gittimemachine'));

      if (backupBranches.length === 0) {
        vscode.window.showInformationMessage('No backup branches found.');
        return;
      }

      // Show quick pick to select backup branch
      const selected = await vscode.window.showQuickPick(backupBranches, {
        placeHolder: 'Select backup branch to restore',
        title: 'Undo Changes'
      });

      if (!selected) {
        return;
      }

      const confirm = await vscode.window.showWarningMessage(
        `This will reset to backup branch: ${selected}. Continue?`,
        { modal: true },
        'Yes, Undo',
        'Cancel'
      );

      if (confirm !== 'Yes, Undo') {
        return;
      }

      try {
        await git.resetToBranch(selected);
        vscode.window.showInformationMessage(
          `✅ Successfully reset to ${selected}`
        );
        commitTreeProvider.refresh();
      } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to undo: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(
    showUnpushedCommand,
    refreshCommand,
    editCommitCommand,
    editCommitFullCommand,
    bulkEditCommand,
    undoCommand,
    openPanelViewCommand,
    refreshPanelViewCommand
  );

  // Initial load
  commitTreeProvider.refresh();

  // Watch for git changes (debounced to prevent infinite refresh)
  let refreshTimeout: NodeJS.Timeout | undefined;
  const debouncedRefresh = () => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    refreshTimeout = setTimeout(() => {
      commitTreeProvider.refresh();
      commitPanelView.refresh();
    }, 500); // Wait 500ms before refreshing
  };

  const gitDirWatcher = vscode.workspace.createFileSystemWatcher('**/.git/refs/**');
  gitDirWatcher.onDidChange(debouncedRefresh);
  gitDirWatcher.onDidCreate(debouncedRefresh);
  gitDirWatcher.onDidDelete(debouncedRefresh);
  context.subscriptions.push(gitDirWatcher);

  const gitHeadWatcher = vscode.workspace.createFileSystemWatcher('**/.git/HEAD');
  gitHeadWatcher.onDidChange(debouncedRefresh);
  context.subscriptions.push(gitHeadWatcher);
}

/**
 * Deactivate the extension
 */
export function deactivate() {
  console.log('Git Time Machine extension is now deactivated');
}

