import * as vscode from 'vscode';
import { Git } from '../../lib/git';

/**
 * Service for managing backup branches
 * Handles creation and restoration of backup branches
 */
export class BackupService {
  private backupBranch: string | null = null;

  constructor(private readonly git: Git) {}

  /**
   * Create a backup branch with a given prefix
   * @param prefix Prefix for the backup branch name
   * @returns The name of the created backup branch
   */
  async createBackup(prefix: string = 'gittimemachine'): Promise<string> {
    this.backupBranch = await this.git.createBackupBranch(prefix);
    
    await vscode.window.showInformationMessage(
      `✅ Created backup branch: ${this.backupBranch}`
    );
    
    return this.backupBranch;
  }

  /**
   * Get the current backup branch name
   */
  getBackupBranch(): string | null {
    return this.backupBranch;
  }

  /**
   * Undo changes by resetting to the backup branch
   * Prompts user for confirmation
   */
  async undoChanges(): Promise<void> {
    if (!this.backupBranch) {
      await vscode.window.showErrorMessage('No backup branch found.');
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
      await this.git.resetToBranch(this.backupBranch);
      await vscode.window.showInformationMessage(
        `✅ Successfully undone changes. Reset to ${this.backupBranch}`
      );
    } catch (error: any) {
      await vscode.window.showErrorMessage(`Failed to undo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Show undo option after successful operation
   */
  async promptForUndo(editCount: number): Promise<void> {
    const choice = await vscode.window.showInformationMessage(
      `✅ Successfully edited ${editCount} commit(s)!`,
      'Undo'
    );

    if (choice === 'Undo') {
      await this.undoChanges();
    }
  }
}

