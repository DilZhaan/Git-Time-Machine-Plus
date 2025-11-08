import { GitCommandExecutor } from '../utils/GitCommandExecutor';
import { GitRebaseHelper } from '../utils/GitRebaseHelper';
import { RebaseScriptManager } from '../utils/RebaseScriptManager';

/**
 * Service for git rebase operations
 * Handles interactive rebase for editing commit messages and timestamps
 */
export class GitRebaseService {
  private readonly rebaseHelper: GitRebaseHelper;

  constructor(private readonly executor: GitCommandExecutor) {
    this.rebaseHelper = new GitRebaseHelper(executor);
  }

  /**
   * Edit an older commit's message using interactive rebase
   */
  async rebaseEditCommitMessage(
    commitHash: string,
    newMessage: string
  ): Promise<void> {
    const scriptManager = new RebaseScriptManager();

    await this.rebaseHelper.executeRebaseWithCleanup(async () => {
      await scriptManager.withScript('reword', commitHash, async (scriptPath) => {
        await this.executor.execute(`git rebase -i ${commitHash}~1`, {
          env: {
            GIT_SEQUENCE_EDITOR: scriptPath,
            GIT_EDITOR: `sh -c 'echo "${this.escapeMessage(newMessage)}" > "$1"' --`,
          },
        });
      });
    });
  }

  /**
   * Edit an older commit's timestamp using interactive rebase
   */
  async rebaseEditCommitTimestamp(
    commitHash: string,
    newDate: Date
  ): Promise<void> {
    const dateString = newDate.toISOString();
    const scriptManager = new RebaseScriptManager();

    await this.rebaseHelper.executeRebaseWithCleanup(async () => {
      await scriptManager.withScript('edit', commitHash, async (scriptPath) => {
        // Step 1: Start interactive rebase
        await this.executor.execute(`git rebase -i ${commitHash}~1`, {
          env: { GIT_SEQUENCE_EDITOR: scriptPath },
        });

        // Step 2: Amend the commit with new timestamp
        await this.executor.execute(`git commit --amend --no-edit --date="${dateString}"`, {
          env: { GIT_COMMITTER_DATE: dateString },
        });

        // Step 3: Continue rebase if still in progress
        await this.rebaseHelper.continueRebaseIfInProgress();
      });
    });
  }

  /**
   * Escape special characters in commit message for shell
   */
  private escapeMessage(message: string): string {
    return message.replace(/"/g, '\\"');
  }
}

