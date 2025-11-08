import * as fs from 'fs';
import * as path from 'path';
import { GitCommandExecutor } from './GitCommandExecutor';

/**
 * Helper for git rebase operations
 * Handles rebase status checks and cleanup
 */
export class GitRebaseHelper {
  constructor(private readonly executor: GitCommandExecutor) {}

  /**
   * Check if a rebase is currently in progress
   */
  isRebaseInProgress(): boolean {
    const gitDir = path.join(this.executor.getWorkspaceRoot(), '.git');
    const rebaseMergeDir = path.join(gitDir, 'rebase-merge');
    const rebaseApplyDir = path.join(gitDir, 'rebase-apply');

    return fs.existsSync(rebaseMergeDir) || fs.existsSync(rebaseApplyDir);
  }

  /**
   * Abort a rebase if one is in progress
   */
  async abortRebaseIfInProgress(): Promise<void> {
    if (this.isRebaseInProgress()) {
      await this.executor.executeSilent('git rebase --abort');
    }
  }

  /**
   * Continue a rebase if one is in progress
   */
  async continueRebaseIfInProgress(): Promise<void> {
    if (this.isRebaseInProgress()) {
      await this.executor.execute('git rebase --continue');
    }
  }

  /**
   * Execute a rebase operation with automatic cleanup on error
   */
  async executeRebaseWithCleanup<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      await this.abortRebaseIfInProgress();
      throw error;
    }
  }
}

