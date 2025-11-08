import { GitCommit, UnpushedCommitsResult } from '../../types';
import { GitCommandExecutor } from '../utils/GitCommandExecutor';
import { CommitParser } from '../utils/CommitParser';
import { GitBranchService } from './GitBranchService';

/**
 * Service for git commit operations
 * Handles commit retrieval and queries
 */
export class GitCommitService {
  private static readonly LOG_FORMAT = '%H|%an|%ae|%at|%s';

  constructor(
    private readonly executor: GitCommandExecutor,
    private readonly branchService: GitBranchService
  ) {}

  /**
   * Get the HEAD commit hash
   */
  async getHeadCommitHash(): Promise<string> {
    return await this.executor.execute('git rev-parse HEAD');
  }

  /**
   * Get unpushed commits from the current branch
   */
  async getUnpushedCommits(): Promise<UnpushedCommitsResult> {
    const currentBranch = await this.branchService.getCurrentBranch();

    if (!currentBranch) {
      throw new Error('Could not determine current branch');
    }

    const remoteBranch = await this.branchService.getRemoteBranch(currentBranch);
    const hasRemote =
      remoteBranch !== null && (await this.branchService.remoteExists(remoteBranch));

    let commits: GitCommit[] = [];

    if (hasRemote && remoteBranch) {
      commits = await this.getCommitsAheadOfRemote(remoteBranch);
    } else {
      commits = await this.getAllCommits();
    }

    return {
      commits,
      currentBranch,
      remoteBranch,
      hasRemote,
    };
  }

  /**
   * Get commits that are ahead of the remote branch
   */
  private async getCommitsAheadOfRemote(remoteBranch: string): Promise<GitCommit[]> {
    await this.branchService.fetch();

    try {
      const output = await this.executor.execute(
        `git log ${remoteBranch}..HEAD --format="${GitCommitService.LOG_FORMAT}"`
      );
      return CommitParser.parseCommits(output);
    } catch (error) {
      console.error('Error getting unpushed commits:', error);
      // If remote branch doesn't exist anymore, get all commits
      return await this.getAllCommits();
    }
  }

  /**
   * Get all commits from the current branch
   */
  private async getAllCommits(): Promise<GitCommit[]> {
    try {
      const output = await this.executor.execute(
        `git log --format="${GitCommitService.LOG_FORMAT}"`
      );
      return CommitParser.parseCommits(output);
    } catch (error) {
      console.error('Error getting commits:', error);
      return [];
    }
  }

  /**
   * Check if the repository has uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    try {
      const output = await this.executor.execute('git status --porcelain');
      return output.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify that a commit is safe to edit (not pushed)
   */
  async isCommitSafeToEdit(commitHash: string): Promise<boolean> {
    const result = await this.getUnpushedCommits();
    return result.commits.some((commit) => commit.hash === commitHash);
  }

  /**
   * Check if a commit is the HEAD commit
   */
  async isHeadCommit(commitHash: string): Promise<boolean> {
    const headHash = await this.getHeadCommitHash();
    return commitHash === headHash;
  }
}

