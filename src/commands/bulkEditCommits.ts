import * as vscode from 'vscode';
import { Git, GitCommitInfo } from '../lib/git';
import { DateTimeWebview } from '../webview/dateTimeWebview';
import { SummaryWebview } from '../webview/summaryWebview';

/**
 * Edit information for a single commit
 */
export interface CommitEditInfo {
  commit: GitCommitInfo;
  newMessage?: string;
  newAuthorDate?: Date;
  newCommitDate?: Date;
}

/**
 * Bulk edit multiple commits command
 */
export class BulkEditCommitsCommand {
  private git: Git;
  private webview: DateTimeWebview | null = null;
  private summaryWebview: SummaryWebview | null = null;
  private backupBranch: string | null = null;

  constructor(
    private context: vscode.ExtensionContext,
    private workspaceRoot: string
  ) {
    this.git = new Git(workspaceRoot);
  }

  /**
   * Execute the bulk edit flow
   */
  async execute(): Promise<void> {
    try {
      // Step 1: Scan unpushed commits
      const unpushedCommits = await this.scanUnpushedCommits();
      if (!unpushedCommits || unpushedCommits.length === 0) {
        vscode.window.showInformationMessage('No unpushed commits found.');
        return;
      }

      // Step 2: Show multi-select QuickPick
      const selectedCommits = await this.showMultiSelectQuickPick(unpushedCommits);
      if (!selectedCommits || selectedCommits.length === 0) {
        return; // User cancelled
      }

      // Safety checks for all selected commits
      const safetyCheck = await this.performSafetyChecks(selectedCommits);
      if (!safetyCheck) {
        return;
      }

      // Create backup branch
      this.backupBranch = await this.createBackupBranch();
      vscode.window.showInformationMessage(
        `✅ Created backup branch: ${this.backupBranch}`
      );

      // Step 3: For each commit, ask for edits
      const edits = await this.collectEditsForCommits(selectedCommits);
      if (edits.length === 0) {
        vscode.window.showInformationMessage('No changes to apply.');
        return;
      }

      // Step 4: Show final summary
      const confirmed = await this.showSummaryAndConfirm(edits);
      if (!confirmed) {
        vscode.window.showInformationMessage('Operation cancelled.');
        return;
      }

      // Step 5: Apply changes in chronological order
      await this.applyEditsInOrder(edits);

      vscode.window.showInformationMessage(
        `✅ Successfully edited ${edits.length} commit(s)!`,
        'Undo'
      ).then(choice => {
        if (choice === 'Undo') {
          this.undoChanges();
        }
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
  }

  /**
   * Step 1: Scan unpushed commits
   */
  private async scanUnpushedCommits(): Promise<GitCommitInfo[]> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Scanning unpushed commits...',
        cancellable: false,
      },
      async () => {
        return await this.git.getUnpushedCommits();
      }
    );
  }

  /**
   * Step 2: Show multi-select QuickPick
   */
  private async showMultiSelectQuickPick(
    commits: GitCommitInfo[]
  ): Promise<GitCommitInfo[] | undefined> {
    interface CommitQuickPickItem extends vscode.QuickPickItem {
      commit: GitCommitInfo;
    }

    const items: CommitQuickPickItem[] = commits.map((commit) => ({
      label: `$(git-commit) ${commit.shortHash}`,
      description: commit.subject,
      detail: `${commit.author} • ${this.formatDate(commit.authorDate)}`,
      commit,
    }));

    const quickPick = vscode.window.createQuickPick<CommitQuickPickItem>();
    quickPick.items = items;
    quickPick.canSelectMany = true;
    quickPick.placeholder = 'Select commits to edit (use space to select multiple)';
    quickPick.title = 'Git Time Machine: Bulk Edit Commits';

    return new Promise((resolve) => {
      quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems.map(item => item.commit);
        quickPick.dispose();
        resolve(selected);
      });

      quickPick.onDidHide(() => {
        quickPick.dispose();
        resolve(undefined);
      });

      quickPick.show();
    });
  }

  /**
   * Perform safety checks on all selected commits
   */
  private async performSafetyChecks(commits: GitCommitInfo[]): Promise<boolean> {
    // Check if any commit exists on remote
    for (const commit of commits) {
      const isOnRemote = await this.git.commitExistsOnRemote(commit.hash);
      if (isOnRemote) {
        vscode.window.showErrorMessage(
          `⚠️ Warning: Commit ${commit.shortHash} exists on remote! Cannot edit safely. Aborting.`,
          { modal: true }
        );
        return false;
      }
    }

    // Check working tree
    const isClean = await this.git.isWorkingTreeClean();
    if (!isClean) {
      const proceed = await vscode.window.showWarningMessage(
        'You have uncommitted changes. It\'s recommended to commit or stash them first. Continue anyway?',
        { modal: true },
        'Continue',
        'Cancel'
      );
      if (proceed !== 'Continue') {
        return false;
      }
    }

    return true;
  }

  /**
   * Create backup branch
   */
  private async createBackupBranch(): Promise<string> {
    return await this.git.createBackupBranch('gittimemachine-bulk');
  }

  /**
   * Step 3: Collect edits for each commit
   */
  private async collectEditsForCommits(
    commits: GitCommitInfo[]
  ): Promise<CommitEditInfo[]> {
    const edits: CommitEditInfo[] = [];

    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      
      vscode.window.showInformationMessage(
        `Editing commit ${i + 1} of ${commits.length}: ${commit.shortHash}`
      );

      const edit = await this.collectEditForSingleCommit(commit);
      
      // Only add to edits if there are actual changes
      if (edit.newMessage || edit.newAuthorDate || edit.newCommitDate) {
        edits.push(edit);
      }
    }

    return edits;
  }

  /**
   * Collect edit information for a single commit
   */
  private async collectEditForSingleCommit(
    commit: GitCommitInfo
  ): Promise<CommitEditInfo> {
    const edit: CommitEditInfo = { commit };

    // Ask: Edit message?
    const shouldEditMessage = await this.askYesNo(
      `Edit message for ${commit.shortHash}?`,
      commit.subject
    );

    if (shouldEditMessage) {
      const currentMessage = await this.git.getCommitMessage(commit.hash);
      const newMessage = await vscode.window.showInputBox({
        prompt: `Enter new message for ${commit.shortHash}`,
        value: currentMessage,
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Commit message cannot be empty';
          }
          return null;
        },
      });
      if (newMessage) {
        edit.newMessage = newMessage;
      }
    }

    // Ask: Edit timestamp?
    const shouldEditTimestamp = await this.askYesNo(
      `Edit timestamp for ${commit.shortHash}?`,
      `Current: ${this.formatDate(commit.authorDate)}`
    );

    if (shouldEditTimestamp) {
      const dates = await this.openDateTimeWebview(commit);
      if (dates) {
        edit.newAuthorDate = dates.authorDate;
        edit.newCommitDate = dates.commitDate;
      }
    }

    return edit;
  }

  /**
   * Ask Yes/No question
   */
  private async askYesNo(question: string, detail?: string): Promise<boolean> {
    const choice = await vscode.window.showQuickPick(
      [
        { label: '✓ Yes', value: true },
        { label: '✗ No', value: false },
      ],
      {
        placeHolder: question,
        title: detail,
      }
    );
    return choice?.value ?? false;
  }

  /**
   * Open webview for date/time selection
   */
  private async openDateTimeWebview(
    commit: GitCommitInfo
  ): Promise<{ authorDate: Date; commitDate: Date } | undefined> {
    this.webview = new DateTimeWebview(this.context, commit);
    return await this.webview.show();
  }

  /**
   * Step 4: Show summary and confirm
   */
  private async showSummaryAndConfirm(edits: CommitEditInfo[]): Promise<boolean> {
    this.summaryWebview = new SummaryWebview(this.context, edits);
    return await this.summaryWebview.show();
  }

  /**
   * Step 5: Apply edits in chronological order (oldest first)
   */
  private async applyEditsInOrder(edits: CommitEditInfo[]): Promise<void> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Applying changes...',
        cancellable: false,
      },
      async (progress) => {
        // Sort by date (oldest first) for proper rebase order
        const sortedEdits = [...edits].sort(
          (a, b) => a.commit.authorDate.getTime() - b.commit.authorDate.getTime()
        );

        for (let i = 0; i < sortedEdits.length; i++) {
          const edit = sortedEdits[i];
          progress.report({
            message: `Processing ${i + 1}/${sortedEdits.length}: ${edit.commit.shortHash}`,
            increment: (100 / sortedEdits.length),
          });

          await this.applySingleEdit(edit);
        }
      }
    );
  }

  /**
   * Apply a single edit
   */
  private async applySingleEdit(edit: CommitEditInfo): Promise<void> {
    const isHead = await this.git.isHeadCommit(edit.commit.hash);

    if (isHead) {
      // Simple amend for HEAD
      await this.git.amendHeadCommit(
        edit.newMessage,
        edit.newAuthorDate,
        edit.newCommitDate
      );
    } else {
      // For non-HEAD commits, use filter-branch or interactive rebase
      // For now, we'll use a simpler approach: edit via amend after checking out
      await this.git.editCommitViaCheckout(
        edit.commit.hash,
        edit.newMessage,
        edit.newAuthorDate,
        edit.newCommitDate
      );
    }
  }

  /**
   * Undo changes by checking out backup branch
   */
  async undoChanges(): Promise<void> {
    if (!this.backupBranch) {
      vscode.window.showErrorMessage('No backup branch found.');
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      `This will reset to backup branch: ${this.backupBranch}. Continue?`,
      { modal: true },
      'Yes, Undo',
      'Cancel'
    );

    if (confirm !== 'Yes, Undo') {
      return;
    }

    try {
      const currentBranch = await this.git.getCurrentBranch();
      await this.git.resetToBranch(this.backupBranch);
      vscode.window.showInformationMessage(
        `✅ Successfully undone changes. Reset to ${this.backupBranch}`
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to undo: ${error.message}`);
    }
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleString();
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.webview?.dispose();
    this.summaryWebview?.dispose();
  }
}

