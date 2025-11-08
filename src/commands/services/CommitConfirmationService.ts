import * as vscode from 'vscode';
import { GitCommitInfo } from '../../lib/git';
import { SummaryWebview } from '../../webview/summaryWebview';
import { CommitEditInfo } from '../types';

/**
 * Service for showing confirmation dialogs
 * Handles summary and confirmation UI for commit operations
 */
export class CommitConfirmationService {
  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Show confirmation for single commit edit
   * Displays all changes and asks for confirmation
   */
  async confirmSingleEdit(
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
      await vscode.window.showInformationMessage('No changes to apply.');
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
   * Show summary webview for bulk edits and get confirmation
   */
  async confirmBulkEdits(edits: CommitEditInfo[]): Promise<boolean> {
    if (edits.length === 0) {
      await vscode.window.showInformationMessage('No changes to apply.');
      return false;
    }

    const summaryWebview = new SummaryWebview(this.context, edits);
    return await summaryWebview.show();
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleString();
  }
}

