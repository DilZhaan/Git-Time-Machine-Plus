import * as vscode from 'vscode';
import { GitCommit, UnpushedCommitsResult } from '../types';
import { GitService } from '../git/gitService';

/**
 * Tree item representing a commmit
 */
export class CommitTreeItem extends vscode.TreeItem {
  constructor(
    public readonly commit: GitCommit | null,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    isEmptyState: boolean = false
  ) {
    super(
      isEmptyState ? 'No unpushed commits' : (commit?.message || 'Unknown'),
      collapsibleState
    );

    if (isEmptyState) {
      this.description = 'All commits are pushed to remote';
      this.iconPath = new vscode.ThemeIcon('check');
      this.contextValue = 'emptyState';
    } else if (commit) {
      this.tooltip = this.createTooltip(commit);
      this.description = this.createDescription(commit);
      this.contextValue = 'unpushedCommit';
      this.iconPath = new vscode.ThemeIcon('git-commit');
    }
  }

  private createTooltip(commit: GitCommit): string {
    return [
      `Hash: ${commit.hash}`,
      `Author: ${commit.author} <${commit.authorEmail}>`,
      `Date: ${commit.date.toLocaleString()}`,
      ``,
      `Message:`,
      commit.message,
    ].join('\n');
  }

  private createDescription(commit: GitCommit): string {
    return `${commit.shortHash} • ${commit.author} • ${this.formatDate(commit.date)}`;
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
  private isRefreshing: boolean = false;

  constructor(private gitService: GitService) {}

  refresh(): void {
    if (!this.isRefreshing) {
      this._onDidChangeTreeData.fire();
    }
  }

  getTreeItem(element: CommitTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: CommitTreeItem): Promise<CommitTreeItem[]> {
    if (element) {
      // No children for commit items
      return [];
    }

    // Prevent concurrent refreshes
    if (this.isRefreshing) {
      return this.unpushedResult?.commits.map(
        (commit) => new CommitTreeItem(commit, vscode.TreeItemCollapsibleState.None, false)
      ) || [];
    }

    try {
      this.isRefreshing = true;
      this.unpushedResult = await this.gitService.getUnpushedCommits();

      // Show empty state message in tree instead of popup
      if (this.unpushedResult.commits.length === 0) {
        return [new CommitTreeItem(null, vscode.TreeItemCollapsibleState.None, true)];
      }

      return this.unpushedResult.commits.map(
        (commit) => new CommitTreeItem(commit, vscode.TreeItemCollapsibleState.None, false)
      );
    } catch (error) {
      // Only show error if it's not a "no commits" scenario
      console.error('Error loading commits:', error);
      return [];
    } finally {
      this.isRefreshing = false;
    }
  }

  getUnpushedResult(): UnpushedCommitsResult | null {
    return this.unpushedResult;
  }
}

