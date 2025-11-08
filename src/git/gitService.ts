import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GitCommit, UnpushedCommitsResult } from '../types';

const execAsync = promisify(exec);

/**
 * Service for interacting with Git repositories
 */
export class GitService {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Get the current branch name
   */
  async getCurrentBranch(): Promise<string | null> {
    try {
      const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.workspaceRoot,
      });
      return stdout.trim();
    } catch (error) {
      console.error('Error getting current branch:', error);
      return null;
    }
  }

  /**
   * Get the remote tracking branch for the current branch
   */
  async getRemoteBranch(branch: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(
        `git config --get branch.${branch}.remote`,
        { cwd: this.workspaceRoot }
      );
      const remote = stdout.trim();

      if (!remote) {
        return null;
      }

      const { stdout: mergeBranch } = await execAsync(
        `git config --get branch.${branch}.merge`,
        { cwd: this.workspaceRoot }
      );
      const branchPath = mergeBranch.trim();
      const branchName = branchPath.replace('refs/heads/', '');

      return `${remote}/${branchName}`;
    } catch (error) {
      // Branch doesn't have a remote tracking branch
      return null;
    }
  }

  /**
   * Check if a remote branch exists
   */
  async remoteExists(remoteBranch: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync('git remote', {
        cwd: this.workspaceRoot,
      });
      const remotes = stdout.trim().split('\n');
      const remote = remoteBranch.split('/')[0];
      return remotes.includes(remote);
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse a git log line into a GitCommit object
   */
  private parseCommit(line: string): GitCommit | null {
    // Format: hash|author|email|timestamp|message
    const parts = line.split('|');
    if (parts.length < 5) {
      return null;
    }

    const [hash, author, email, timestamp, ...messageParts] = parts;
    const message = messageParts.join('|'); // In case message contains |

    return {
      hash: hash.trim(),
      shortHash: hash.trim().substring(0, 7),
      author: author.trim(),
      authorEmail: email.trim(),
      timestamp: parseInt(timestamp.trim(), 10),
      date: new Date(parseInt(timestamp.trim(), 10) * 1000),
      message: message.trim(),
      isPushed: false,
    };
  }

  /**
   * Get unpushed commits from the current branch
   */
  async getUnpushedCommits(): Promise<UnpushedCommitsResult> {
    const currentBranch = await this.getCurrentBranch();

    if (!currentBranch) {
      throw new Error('Could not determine current branch');
    }

    const remoteBranch = await this.getRemoteBranch(currentBranch);
    const hasRemote = remoteBranch !== null && (await this.remoteExists(remoteBranch));

    let commits: GitCommit[] = [];

    if (hasRemote && remoteBranch) {
      // Fetch latest remote data
      try {
        await execAsync('git fetch', { cwd: this.workspaceRoot });
      } catch (error) {
        console.warn('Could not fetch from remote:', error);
      }

      // Get commits that are ahead of remote
      try {
        const { stdout } = await execAsync(
          `git log ${remoteBranch}..HEAD --format="%H|%an|%ae|%at|%s"`,
          { cwd: this.workspaceRoot }
        );

        if (stdout.trim()) {
          commits = stdout
            .trim()
            .split('\n')
            .map((line) => this.parseCommit(line))
            .filter((commit): commit is GitCommit => commit !== null);
        }
      } catch (error) {
        console.error('Error getting unpushed commits:', error);
        // If remote branch doesn't exist anymore, get all commits
        const { stdout } = await execAsync(
          `git log --format="%H|%an|%ae|%at|%s"`,
          { cwd: this.workspaceRoot }
        );

        if (stdout.trim()) {
          commits = stdout
            .trim()
            .split('\n')
            .map((line) => this.parseCommit(line))
            .filter((commit): commit is GitCommit => commit !== null);
        }
      }
    } else {
      // No remote branch, all commits are considered unpushed
      try {
        const { stdout } = await execAsync(
          `git log --format=%H|%an|%ae|%at|%s`,
          { cwd: this.workspaceRoot }
        );

        if (stdout.trim()) {
          commits = stdout
            .trim()
            .split('\n')
            .map((line) => this.parseCommit(line))
            .filter((commit): commit is GitCommit => commit !== null);
        }
      } catch (error) {
        console.error('Error getting commits:', error);
      }
    }

    return {
      commits,
      currentBranch,
      remoteBranch,
      hasRemote,
    };
  }

  /**
   * Edit a commit message
   */
  async editCommitMessage(commitHash: string, newMessage: string): Promise<void> {
    try {
      // Use git commit --amend for the most recent commit
      const { stdout } = await execAsync('git rev-parse HEAD', {
        cwd: this.workspaceRoot,
      });
      const headHash = stdout.trim();

      if (commitHash === headHash) {
        await execAsync(`git commit --amend -m "${newMessage.replace(/"/g, '\\"')}"`, {
          cwd: this.workspaceRoot,
        });
      } else {
        // For older commits, use filter-branch approach
        await this.rebaseEditCommitMessage(commitHash, newMessage);
      }
    } catch (error) {
      throw new Error(`Failed to edit commit message: ${error}`);
    }
  }

  /**
   * Rebase to edit an older commit's message
   */
  private async rebaseEditCommitMessage(commitHash: string, newMessage: string): Promise<void> {
    // Create a temporary script for the sequence editor
    const tmpDir = os.tmpdir();
    const scriptPath = path.join(tmpDir, `git-rebase-script-${Date.now()}.sh`);
    
    // Script to replace 'pick' with 'reword' for the target commit
    const script = `#!/bin/sh
sed -i.bak "s/^pick ${commitHash.substring(0, 7)}/reword ${commitHash.substring(0, 7)}/" "$1"
`;

    fs.writeFileSync(scriptPath, script, { mode: 0o755 });

    try {
      // Step 1: Start the interactive rebase with our custom sequence editor
      await execAsync(`git rebase -i ${commitHash}~1`, {
        cwd: this.workspaceRoot,
        env: {
          ...process.env,
          GIT_SEQUENCE_EDITOR: scriptPath,
          GIT_EDITOR: `sh -c 'echo "${newMessage.replace(/"/g, '\\"')}" > "$1"' --`
        }
      });

      // Clean up the script file
      fs.unlinkSync(scriptPath);
    } catch (error: any) {
      // Clean up the script file even on error
      try {
        fs.unlinkSync(scriptPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      // Check if we're in the middle of a rebase
      const gitDir = path.join(this.workspaceRoot, '.git');
      const rebaseMergeDir = path.join(gitDir, 'rebase-merge');
      const rebaseApplyDir = path.join(gitDir, 'rebase-apply');
      
      if (fs.existsSync(rebaseMergeDir) || fs.existsSync(rebaseApplyDir)) {
        // Abort the rebase
        try {
          await execAsync('git rebase --abort', { cwd: this.workspaceRoot });
        } catch (abortError) {
          // Ignore abort errors
        }
      }

      throw error;
    }
  }

  /**
   * Edit a commit timestamp
   */
  async editCommitTimestamp(commitHash: string, newDate: Date): Promise<void> {
    try {
      const dateString = newDate.toISOString();

      // Check if it's the HEAD commit
      const { stdout } = await execAsync('git rev-parse HEAD', {
        cwd: this.workspaceRoot,
      });
      const headHash = stdout.trim();

      if (commitHash === headHash) {
        await execAsync(
          `git commit --amend --no-edit --date="${dateString}"`,
          { cwd: this.workspaceRoot, env: { ...process.env, GIT_COMMITTER_DATE: dateString } }
        );
      } else {
        // For older commits, use filter-branch to rewrite the commit
        await this.rebaseEditCommitTimestamp(commitHash, newDate);
      }
    } catch (error) {
      throw new Error(`Failed to edit commit timestamp: ${error}`);
    }
  }

  /**
   * Rebase to edit an older commit's timestamp
   */
  private async rebaseEditCommitTimestamp(commitHash: string, newDate: Date): Promise<void> {
    const dateString = newDate.toISOString();

    // Create a temporary script for the sequence editor
    const tmpDir = os.tmpdir();
    const scriptPath = path.join(tmpDir, `git-rebase-script-${Date.now()}.sh`);
    
    // Script to replace 'pick' with 'edit' for the target commit
    const script = `#!/bin/sh
sed -i.bak "s/^pick ${commitHash.substring(0, 7)}/edit ${commitHash.substring(0, 7)}/" "$1"
`;

    fs.writeFileSync(scriptPath, script, { mode: 0o755 });

    try {
      // Step 1: Start the interactive rebase
      await execAsync(`git rebase -i ${commitHash}~1`, {
        cwd: this.workspaceRoot,
        env: {
          ...process.env,
          GIT_SEQUENCE_EDITOR: scriptPath
        }
      });

      // Step 2: Amend the commit with new timestamp
      await execAsync('git commit --amend --no-edit --date="' + dateString + '"', {
        cwd: this.workspaceRoot,
        env: {
          ...process.env,
          GIT_COMMITTER_DATE: dateString
        }
      });

      // Step 3: Continue the rebase
      await execAsync('git rebase --continue', {
        cwd: this.workspaceRoot
      });

      // Clean up the script file
      fs.unlinkSync(scriptPath);
    } catch (error: any) {
      // Clean up the script file even on error
      try {
        fs.unlinkSync(scriptPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      // Check if we're in the middle of a rebase
      const gitDir = path.join(this.workspaceRoot, '.git');
      const rebaseMergeDir = path.join(gitDir, 'rebase-merge');
      const rebaseApplyDir = path.join(gitDir, 'rebase-apply');
      
      if (fs.existsSync(rebaseMergeDir) || fs.existsSync(rebaseApplyDir)) {
        // Abort the rebase
        try {
          await execAsync('git rebase --abort', { cwd: this.workspaceRoot });
        } catch (abortError) {
          // Ignore abort errors
        }
      }

      throw error;
    }
  }

  /**
   * Check if the repository has uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('git status --porcelain', {
        cwd: this.workspaceRoot,
      });
      return stdout.trim().length > 0;
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
}

