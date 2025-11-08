import * as vscode from 'vscode';
import { GitCommitInfo } from '../../lib/git';

/**
 * Service for commit selection UI interactions
 * Handles QuickPick dialogs for single and multiple commit selection
 */
export class CommitSelectionService {
  /**
   * Show QuickPick for single commit selection
   * @returns Selected commit or undefined if cancelled
   */
  async selectSingleCommit(commits: GitCommitInfo[]): Promise<GitCommitInfo | undefined> {
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
      title: 'Git Time Machine: Edit Commit',
    });

    return selected?.commit;
  }

  /**
   * Show multi-select QuickPick for bulk operations
   * @returns Selected commits or undefined if cancelled
   */
  async selectMultipleCommits(commits: GitCommitInfo[]): Promise<GitCommitInfo[] | undefined> {
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
        const selected = quickPick.selectedItems.map((item) => item.commit);
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
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleString();
  }
}

