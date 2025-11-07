import * as vscode from 'vscode';
import { Git, GitCommitInfo } from '../lib/git';
import { DateTimeWebview } from '../webview/dateTimeWebview';

/**
 * Edit commit command - implements the complete flow
 */
export class EditCommitCommand {
  private git: Git;
  private webview: DateTimeWebview | null = null;

  constructor(
    private context: vscode.ExtensionContext,
    private workspaceRoot: string
  ) {
    this.git = new Git(workspaceRoot);
  }

  /**
   * Execute the complete edit commit flow
   */
  async execute(): Promise<void> {
    try {
      // Step 1: Scan unpushed commits
      const unpushedCommits = await this.scanUnpushedCommits();
      if (!unpushedCommits || unpushedCommits.length === 0) {
        vscode.window.showInformationMessage('No unpushed commits found.');
        return;
      }

      // Step 2: Show QuickPick to select commit
      const selectedCommit = await this.showCommitQuickPick(unpushedCommits);
      if (!selectedCommit) {
        return; // User cancelled
      }

      // Safety check: Verify commit is not on remote
      const isOnRemote = await this.checkCommitOnRemote(selectedCommit.hash);
      if (isOnRemote) {
        vscode.window.showErrorMessage(
          '⚠️ Warning: This commit exists on remote! Cannot edit safely. Aborting.',
          { modal: true }
        );
        return;
      }

      // Check working tree is clean
      const isClean = await this.git.isWorkingTreeClean();
      if (!isClean) {
        const proceed = await vscode.window.showWarningMessage(
          'You have uncommitted changes. It\'s recommended to commit or stash them first. Continue anyway?',
          { modal: true },
          'Continue',
          'Cancel'
        );
        if (proceed !== 'Continue') {
          return;
        }
      }

      // Create backup branch
      const backupBranch = await this.createBackupBranch();
      vscode.window.showInformationMessage(
        `✅ Created backup branch: ${backupBranch}`
      );

      // Step 3: Ask if user wants to edit message
      const editMessage = await this.askEditMessage();
      let newMessage: string | undefined;
      
      if (editMessage) {
        const currentMessage = await this.git.getCommitMessage(selectedCommit.hash);
        newMessage = await this.promptForNewMessage(currentMessage);
        if (newMessage === undefined) {
          return; // User cancelled
        }
      }

      // Step 4: Ask if user wants to edit timestamp
      const editTimestamp = await this.askEditTimestamp();
      let newAuthorDate: Date | undefined;
      let newCommitDate: Date | undefined;

      if (editTimestamp) {
        // Step 5: Open Webview with date/time picker
        const dates = await this.openDateTimeWebview(selectedCommit);
        if (!dates) {
          return; // User cancelled
        }
        newAuthorDate = dates.authorDate;
        newCommitDate = dates.commitDate;
      }

      // Step 6: Confirm screen
      const confirmed = await this.showConfirmation(
        selectedCommit,
        newMessage,
        newAuthorDate,
        newCommitDate
      );
      
      if (!confirmed) {
        vscode.window.showInformationMessage('Operation cancelled.');
        return;
      }

      // Step 7: Perform git amend via rebase
      await this.performGitAmend(
        selectedCommit,
        newMessage,
        newAuthorDate,
        newCommitDate
      );

      vscode.window.showInformationMessage(
        `✅ Successfully edited commit ${selectedCommit.shortHash}!`
      );

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
   * Step 2: Show QuickPick to select commit
   */
  private async showCommitQuickPick(
    commits: GitCommitInfo[]
  ): Promise<GitCommitInfo | undefined> {
    interface CommitQuickPickItem extends vscode.QuickPickItem {
      commit: GitCommitInfo;
    }

    const items: CommitQuickPickItem[] = commits.map((commit) => ({
      label: `$(git-commit) ${commit.shortHash}`,
      description: commit.subject,
      detail: `${commit.author} • ${this.formatDate(commit.authorDate)}`,
      commit,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a commit to edit',
      matchOnDescription: true,
      matchOnDetail: true,
    });

    return selected?.commit;
  }

  /**
   * Safety check: Verify commit is not on remote
   */
  private async checkCommitOnRemote(hash: string): Promise<boolean> {
    return await this.git.commitExistsOnRemote(hash);
  }

  /**
   * Create backup branch before rewriting
   */
  private async createBackupBranch(): Promise<string> {
    return await this.git.createBackupBranch('gittimemachine');
  }

  /**
   * Step 3: Ask if user wants to edit message
   */
  private async askEditMessage(): Promise<boolean> {
    const choice = await vscode.window.showQuickPick(
      [
        { label: '✏️ Yes, edit message', value: true },
        { label: '⏭️ No, keep current message', value: false },
      ],
      {
        placeHolder: 'Do you want to edit the commit message?',
      }
    );
    return choice?.value ?? false;
  }

  /**
   * Prompt for new commit message
   */
  private async promptForNewMessage(currentMessage: string): Promise<string | undefined> {
    return await vscode.window.showInputBox({
      prompt: 'Enter new commit message',
      value: currentMessage,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Commit message cannot be empty';
        }
        return null;
      },
    });
  }

  /**
   * Step 4: Ask if user wants to edit timestamp
   */
  private async askEditTimestamp(): Promise<boolean> {
    const choice = await vscode.window.showQuickPick(
      [
        { label: '📅 Yes, edit timestamp', value: true },
        { label: '⏭️ No, keep current timestamp', value: false },
      ],
      {
        placeHolder: 'Do you want to edit the commit timestamp?',
      }
    );
    return choice?.value ?? false;
  }

  /**
   * Step 5: Open Webview with date/time picker
   */
  private async openDateTimeWebview(
    commit: GitCommitInfo
  ): Promise<{ authorDate: Date; commitDate: Date } | undefined> {
    this.webview = new DateTimeWebview(this.context, commit);
    return await this.webview.show();
  }

  /**
   * Step 6: Show confirmation screen
   */
  private async showConfirmation(
    commit: GitCommitInfo,
    newMessage?: string,
    newAuthorDate?: Date,
    newCommitDate?: Date
  ): Promise<boolean> {
    const changes: string[] = [];

    if (newMessage) {
      changes.push(`Message: "${commit.subject}" → "${newMessage}"`);
    }

    if (newAuthorDate) {
      changes.push(
        `Author Date: ${this.formatDate(commit.authorDate)} → ${this.formatDate(newAuthorDate)}`
      );
    }

    if (newCommitDate) {
      changes.push(
        `Commit Date: ${this.formatDate(commit.commitDate)} → ${this.formatDate(newCommitDate)}`
      );
    }

    if (changes.length === 0) {
      vscode.window.showInformationMessage('No changes to apply.');
      return false;
    }

    const message = [
      `You are about to edit commit ${commit.shortHash}:`,
      '',
      ...changes,
      '',
      'This will rewrite git history. Continue?',
    ].join('\n');

    const choice = await vscode.window.showWarningMessage(
      message,
      { modal: true },
      'Confirm',
      'Cancel'
    );

    return choice === 'Confirm';
  }

  /**
   * Step 7: Perform git amend
   */
  private async performGitAmend(
    commit: GitCommitInfo,
    newMessage?: string,
    newAuthorDate?: Date,
    newCommitDate?: Date
  ): Promise<void> {
    const isHead = await this.git.isHeadCommit(commit.hash);

    if (isHead) {
      // Simple amend for HEAD commit
      await this.git.amendHeadCommit(newMessage, newAuthorDate, newCommitDate);
    } else {
      // For older commits, we need interactive rebase
      // This is simplified - in practice, you'd need a more robust solution
      vscode.window.showWarningMessage(
        'Editing non-HEAD commits requires interactive rebase. Currently, only HEAD commits are fully supported via webview.'
      );
      throw new Error('Only HEAD commit editing is fully implemented with webview');
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
  }
}

