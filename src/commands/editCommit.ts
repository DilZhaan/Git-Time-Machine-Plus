import * as vscode from 'vscode';
import { Git, GitCommitInfo } from '../lib/git';
import {
  SafetyCheckService,
  CommitSelectionService,
  BackupService,
  CommitEditCollectionService,
  CommitConfirmationService,
  CommitEditApplicationService,
} from './services';

/**
 * Edit commit command - orchestrates the complete edit flow
 * Follows the Command pattern with service delegation
 */
export class EditCommitCommand {
  private readonly git: Git;
  private readonly safetyCheckService: SafetyCheckService;
  private readonly selectionService: CommitSelectionService;
  private readonly backupService: BackupService;
  private readonly editCollectionService: CommitEditCollectionService;
  private readonly confirmationService: CommitConfirmationService;
  private readonly editApplicationService: CommitEditApplicationService;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly workspaceRoot: string
  ) {
    // Initialize git and services
    this.git = new Git(workspaceRoot);
    this.safetyCheckService = new SafetyCheckService(this.git);
    this.selectionService = new CommitSelectionService();
    this.backupService = new BackupService(this.git);
    this.editCollectionService = new CommitEditCollectionService(this.git, context);
    this.confirmationService = new CommitConfirmationService(context);
    this.editApplicationService = new CommitEditApplicationService(this.git);
  }

  /**
   * Execute the complete edit commit flow
   * Orchestrates services to implement the workflow
   */
  async execute(): Promise<void> {
    try {
      // Step 1: Scan unpushed commits
      const unpushedCommits = await this.scanUnpushedCommits();
      if (!await this.safetyCheckService.verifyUnpushedCommitsExist(unpushedCommits)) {
        return;
      }

      // Step 2: Select commit to edit
      const selectedCommit = await this.selectionService.selectSingleCommit(unpushedCommits);
      if (!selectedCommit) {
        return; // User cancelled
      }

      // Step 3: Perform safety checks
      if (!await this.safetyCheckService.checkCommitSafety(selectedCommit)) {
        return;
      }

      // Step 4: Create backup branch
      await this.backupService.createBackup('gittimemachine');

      // Step 5: Collect edit information
      const { newMessage, newAuthorDate, newCommitDate } = await this.collectEdits(selectedCommit);

      // Step 6: Confirm changes
      const confirmed = await this.confirmationService.confirmSingleEdit(
        selectedCommit,
        newMessage,
        newAuthorDate,
        newCommitDate
      );
      
      if (!confirmed) {
        await vscode.window.showInformationMessage('Operation cancelled.');
        return;
      }

      // Step 7: Validate and apply edit
      await this.editApplicationService.validateHeadCommitEdit(selectedCommit.hash);
      await this.performGitAmend(selectedCommit, newMessage, newAuthorDate, newCommitDate);

      await vscode.window.showInformationMessage(
        `✅ Successfully edited commit ${selectedCommit.shortHash}!`
      );
    } catch (error: any) {
      await vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
  }

  /**
   * Scan unpushed commits with progress indication
   */
  private async scanUnpushedCommits(): Promise<GitCommitInfo[]> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Scanning unpushed commits...',
        cancellable: false,
      },
      async () => await this.git.getUnpushedCommits()
    );
  }

  /**
   * Collect edit information from user
   */
  private async collectEdits(commit: GitCommitInfo): Promise<{
    newMessage?: string;
    newAuthorDate?: Date;
    newCommitDate?: Date;
  }> {
    let newMessage: string | undefined;
    let newAuthorDate: Date | undefined;
    let newCommitDate: Date | undefined;

    // Ask if user wants to edit message
    const editMessage = await this.editCollectionService.askEditMessage();
    if (editMessage) {
      const currentMessage = await this.git.getCommitMessage(commit.hash);
      newMessage = await vscode.window.showInputBox({
      prompt: 'Enter new commit message',
      value: currentMessage,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Commit message cannot be empty';
        }
        return null;
      },
    });
      if (newMessage === undefined) {
        throw new Error('Operation cancelled');
      }
    }

    // Ask if user wants to edit timestamp
    const editTimestamp = await this.editCollectionService.askEditTimestamp();
    if (editTimestamp) {
      const edit = await this.editCollectionService.collectEditForCommit(commit);
      newAuthorDate = edit.newAuthorDate;
      newCommitDate = edit.newCommitDate;
    }

    return { newMessage, newAuthorDate, newCommitDate };
  }

  /**
   * Perform git amend operation
   */
  private async performGitAmend(
    commit: GitCommitInfo,
    newMessage?: string,
    newAuthorDate?: Date,
    newCommitDate?: Date
  ): Promise<void> {
      await this.git.amendHeadCommit(newMessage, newAuthorDate, newCommitDate);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    // Services are stateless and don't require cleanup
  }
}

