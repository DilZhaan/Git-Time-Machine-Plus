import * as vscode from 'vscode';
import { GitCommit, UnpushedCommitsResult } from '../types';
import { GitService } from '../git/gitService';

/**
 * Tree item representing a commit
 */
export class CommitTreeItem extends vscode.TreeItem {
  constructor(
    public readonly commit: GitCommit,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(commit.message, collapsibleState);

    this.tooltip = this.createTooltip();
    this.description = this.createDescription();
    this.contextValue = 'unpushedCommit';
    this.iconPath = new vscode.ThemeIcon('git-commit');
  }

  private createTooltip(): string {
    const { commit } = this;
    return [
      `Hash: ${commit.hash}`,
      `Author: ${commit.author} <${commit.authorEmail}>`,
      `Date: ${commit.date.toLocaleString()}`,
      ``,
      `Message:`,
      commit.message,
    ].join('\n');
  }

  private createDescription(): string {
    return `${this.commit.shortHash} • ${this.commit.author} • ${this.formatDate(this.commit.date)}`;
  }

  private formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  }
}

/**
 * Tree data provider for unpushed commits
 */
export class CommitTreeProvider implements vscode.TreeDataProvider<CommitTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<CommitTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private unpushedResult: UnpushedCommitsResult | null = null;

  constructor(private gitService: GitService) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CommitTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: CommitTreeItem): Promise<CommitTreeItem[]> {
    if (element) {
      // No children for commit items
      return [];
    }

    try {
      this.unpushedResult = await this.gitService.getUnpushedCommits();

      if (this.unpushedResult.commits.length === 0) {
        vscode.window.showInformationMessage(
          'No unpushed commits found on the current branch.'
        );
        return [];
      }

      return this.unpushedResult.commits.map(
        (commit) => new CommitTreeItem(commit, vscode.TreeItemCollapsibleState.None)
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Error loading commits: ${error}`);
      return [];
    }
  }

  getUnpushedResult(): UnpushedCommitsResult | null {
    return this.unpushedResult;
  }
}

