import * as vscode from 'vscode';
import { Git } from '../../lib/git';
import { CommitEditInfo } from '../types';

/**
 * Service for applying commit edits
 * Handles the actual git operations to modify commits
 */
export class CommitEditApplicationService {
  constructor(private readonly git: Git) {}

  /**
   * Apply a single edit to a commit
   * Determines whether to use amend or checkout strategy
   */
  async applySingleEdit(edit: CommitEditInfo): Promise<void> {
    const isHead = await this.git.isHeadCommit(edit.commit.hash);

    if (isHead) {
      await this.applyHeadEdit(edit);
    } else {
      await this.applyNonHeadEdit(edit);
    }
  }

  /**
   * Apply multiple edits in chronological order (oldest first)
   * Shows progress during operation
   */
  async applyEditsInOrder(edits: CommitEditInfo[]): Promise<void> {
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
            increment: 100 / sortedEdits.length,
          });

          await this.applySingleEdit(edit);
        }
      }
    );
  }

  /**
   * Apply edit to HEAD commit using amend
   */
  private async applyHeadEdit(edit: CommitEditInfo): Promise<void> {
    await this.git.amendHeadCommit(
      edit.newMessage,
      edit.newAuthorDate,
      edit.newCommitDate
    );
  }

  /**
   * Apply edit to non-HEAD commit using checkout strategy
   */
  private async applyNonHeadEdit(edit: CommitEditInfo): Promise<void> {
    await this.git.editCommitViaCheckout(
      edit.commit.hash,
      edit.newMessage,
      edit.newAuthorDate,
      edit.newCommitDate
    );
  }

  /**
   * Validate that HEAD commit editing is supported
   * Throws error if trying to edit non-HEAD commit without full support
   */
  async validateHeadCommitEdit(hash: string): Promise<void> {
    const isHead = await this.git.isHeadCommit(hash);
    
    if (!isHead) {
      await vscode.window.showWarningMessage(
        'Editing non-HEAD commits requires interactive rebase. Currently, only HEAD commits are fully supported via webview.'
      );
      throw new Error('Only HEAD commit editing is fully implemented with webview');
    }
  }
}

