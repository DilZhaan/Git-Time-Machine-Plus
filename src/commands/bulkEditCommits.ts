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
import { CommitEditInfo } from './types';

/**
 * Bulk edit multiple commits command
 * Orchestrates services to implement bulk editing workflow
 */
export class BulkEditCommitsCommand {
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
   * Execute the bulk edit flow
   * Orchestrates services to implement the workflow
   */
  async execute(): Promise<void> {
    try {
      // Step 1: Scan unpushed commits
      const unpushedCommits = await this.scanUnpushedCommits();
      if (!await this.safetyCheckService.verifyUnpushedCommitsExist(unpushedCommits)) {
        return;
      }

      // Step 2: Show multi-select QuickPick
      const selectedCommits = await this.selectionService.selectMultipleCommits(unpushedCommits);
      if (!selectedCommits || selectedCommits.length === 0) {
        return; // User cancelled
      }

      // Step 3: Perform safety checks for all selected commits
      if (!await this.safetyCheckService.checkMultipleCommitsSafety(selectedCommits)) {
        return;
      }

      // Step 4: Create backup branch
      await this.backupService.createBackup('gittimemachine-bulk');

      // Step 5: Collect edits for each commit
      const edits = await this.editCollectionService.collectEditsForCommits(selectedCommits);

      // Step 6: Show final summary and confirm
      const confirmed = await this.confirmationService.confirmBulkEdits(edits);
      if (!confirmed) {
        await vscode.window.showInformationMessage('Operation cancelled.');
        return;
      }

      // Step 7: Apply changes in chronological order
      await this.editApplicationService.applyEditsInOrder(edits);

      // Step 8: Show success message with undo option
      await this.backupService.promptForUndo(edits.length);
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
   * Undo changes by checking out backup branch
   * Delegates to BackupService
   */
  async undoChanges(): Promise<void> {
    await this.backupService.undoChanges();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    // Services are stateless and don't require cleanup
  }
}


