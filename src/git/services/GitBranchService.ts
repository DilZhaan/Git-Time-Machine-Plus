import { GitCommandExecutor } from '../utils/GitCommandExecutor';

/**
 * Service for git branch operations
 * Handles branch-related queries and remote tracking
 */
export class GitBranchService {
  constructor(private readonly executor: GitCommandExecutor) {}

  /**
   * Get the current branch name
   */
  async getCurrentBranch(): Promise<string | null> {
    try {
      return await this.executor.execute('git rev-parse --abbrev-ref HEAD');
    } catch (error) {
      console.error('Error getting current branch:', error);
      return null;
    }
  }

  /**
   * Get the remote tracking branch for a given branch
   */
  async getRemoteBranch(branch: string): Promise<string | null> {
    try {
      const remote = await this.executor.executeOrNull(
        `git config --get branch.${branch}.remote`
      );

      if (!remote) {
        return null;
      }

      const mergeBranch = await this.executor.executeOrNull(
        `git config --get branch.${branch}.merge`
      );

      if (!mergeBranch) {
        return null;
      }

      const branchName = mergeBranch.replace('refs/heads/', '');
      return `${remote}/${branchName}`;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if a remote exists for a given remote branch
   */
  async remoteExists(remoteBranch: string): Promise<boolean> {
    try {
      const output = await this.executor.execute('git remote');
      const remotes = output.split('\n').filter(Boolean);
      const remote = remoteBranch.split('/')[0];
      return remotes.includes(remote);
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch latest data from remote
   */
  async fetch(): Promise<boolean> {
    try {
      await this.executor.execute('git fetch');
      return true;
    } catch (error) {
      console.warn('Could not fetch from remote:', error);
      return false;
    }
  }
}

