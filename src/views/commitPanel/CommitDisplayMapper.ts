/**
 * Service for mapping Git commits to display information
 * Follows Single Responsibility Principle
 */

import { GitCommit } from '../../types';
import { CommitDisplayInfo } from './types';

export class CommitDisplayMapper {
  /**
   * Convert a GitCommit to display information
   */
  public toDisplayInfo(commit: GitCommit): CommitDisplayInfo {
    return {
      hash: commit.hash,
      shortHash: commit.shortHash,
      message: commit.message,
      author: commit.author,
      authorEmail: commit.authorEmail,
      authorDate: commit.date.toISOString(),
      commitDate: commit.date.toISOString(),
      relativeDate: this.getRelativeTime(commit.date)
    };
  }

  /**
   * Convert multiple commits to display information
   */
  public toDisplayInfoList(commits: GitCommit[]): CommitDisplayInfo[] {
    return commits.map(c => this.toDisplayInfo(c));
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   */
  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    }
    if (hours > 0) {
      return `${hours}h ago`;
    }
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return 'Just now';
  }
}

