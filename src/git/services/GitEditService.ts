import { GitCommandExecutor } from '../utils/GitCommandExecutor';
import { GitCommitService } from './GitCommitService';
import { GitRebaseService } from './GitRebaseService';

/**
 * Service for editing git commits
 * Coordinates commit message and timestamp editing operations
 */
export class GitEditService {
  constructor(
    private readonly executor: GitCommandExecutor,
    private readonly commitService: GitCommitService,
    private readonly rebaseService: GitRebaseService
  ) {}

  /**
   * Edit a commit message
   * Uses amend for HEAD commit, rebase for older commits
   */
  async editCommitMessage(commitHash: string, newMessage: string): Promise<void> {
    try {
      const isHead = await this.commitService.isHeadCommit(commitHash);

      if (isHead) {
        await this.amendCommitMessage(newMessage);
      } else {
        await this.rebaseService.rebaseEditCommitMessage(commitHash, newMessage);
      }
    } catch (error) {
      throw new Error(`Failed to edit commit message: ${error}`);
    }
  }

  /**
   * Edit a commit timestamp
   * Uses amend for HEAD commit, rebase for older commits
   */
  async editCommitTimestamp(commitHash: string, newDate: Date): Promise<void> {
    try {
      const isHead = await this.commitService.isHeadCommit(commitHash);

      if (isHead) {
        await this.amendCommitTimestamp(newDate);
      } else {
        await this.rebaseService.rebaseEditCommitTimestamp(commitHash, newDate);
      }
    } catch (error) {
      throw new Error(`Failed to edit commit timestamp: ${error}`);
    }
  }

  /**
   * Amend the HEAD commit's message
   */
  private async amendCommitMessage(newMessage: string): Promise<void> {
    const escapedMessage = newMessage.replace(/"/g, '\\"');
    await this.executor.execute(`git commit --amend -m "${escapedMessage}"`);
  }

  /**
   * Amend the HEAD commit's timestamp
   */
  private async amendCommitTimestamp(newDate: Date): Promise<void> {
    const dateString = newDate.toISOString();
    await this.executor.execute(`git commit --amend --no-edit --date="${dateString}"`, {
      env: { GIT_COMMITTER_DATE: dateString },
    });
  }
}

