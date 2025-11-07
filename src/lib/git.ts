import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Git helper functions
 */
export class Git {
  constructor(private workspaceRoot: string) {}

  /**
   * Execute a git command
   */
  private async exec(command: string): Promise<string> {
    try {
      const { stdout } = await execAsync(command, {
        cwd: this.workspaceRoot,
      });
      return stdout.trim();
    } catch (error: any) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    return await this.exec('git rev-parse --abbrev-ref HEAD');
  }

  /**
   * Get remote tracking branch
   */
  async getRemoteBranch(branch: string): Promise<string | null> {
    try {
      const remote = await this.exec(`git config --get branch.${branch}.remote`);
      const merge = await this.exec(`git config --get branch.${branch}.merge`);
      const branchName = merge.replace('refs/heads/', '');
      return `${remote}/${branchName}`;
    } catch {
      return null;
    }
  }

  /**
   * Check if commit exists on remote
   */
  async commitExistsOnRemote(commitHash: string): Promise<boolean> {
    try {
      const remoteBranch = await this.getRemoteBranch(await this.getCurrentBranch());
      if (!remoteBranch) {
        return false;
      }
      
      // Check if commit is reachable from remote
      const result = await this.exec(
        `git branch -r --contains ${commitHash}`
      );
      return result.includes(remoteBranch);
    } catch {
      return false;
    }
  }

  /**
   * Get unpushed commits
   */
  async getUnpushedCommits(): Promise<GitCommitInfo[]> {
    const currentBranch = await this.getCurrentBranch();
    const remoteBranch = await this.getRemoteBranch(currentBranch);

    if (!remoteBranch) {
      // No remote, get all commits
      const output = await this.exec(
        'git log --format="%H|%s|%an|%ae|%at|%ct" --all'
      );
      return this.parseCommits(output);
    }

    try {
      // Fetch to get latest remote state
      await this.exec('git fetch');
      
      // Get commits ahead of remote
      const output = await this.exec(
        `git log ${remoteBranch}..HEAD --format="%H|%s|%an|%ae|%at|%ct"`
      );
      return this.parseCommits(output);
    } catch {
      // Remote might not exist, get all commits
      const output = await this.exec(
        'git log --format="%H|%s|%an|%ae|%at|%ct"'
      );
      return this.parseCommits(output);
    }
  }

  /**
   * Parse git log output
   */
  private parseCommits(output: string): GitCommitInfo[] {
    if (!output) {
      return [];
    }

    return output.split('\n').map((line) => {
      const [hash, subject, author, email, authorDate, commitDate] = line.split('|');
      return {
        hash,
        shortHash: hash.substring(0, 7),
        subject,
        author,
        email,
        authorDate: new Date(parseInt(authorDate) * 1000),
        commitDate: new Date(parseInt(commitDate) * 1000),
      };
    });
  }

  /**
   * Get commit details
   */
  async getCommitDetails(hash: string): Promise<CommitDetails> {
    const format = '%H|%s|%b|%an|%ae|%at|%cn|%ce|%ct';
    const output = await this.exec(`git show -s --format="${format}" ${hash}`);
    
    const [
      fullHash,
      subject,
      body,
      author,
      authorEmail,
      authorDate,
      committer,
      committerEmail,
      commitDate,
    ] = output.split('|');

    return {
      hash: fullHash,
      subject,
      body,
      author,
      authorEmail,
      authorDate: new Date(parseInt(authorDate) * 1000),
      committer,
      committerEmail,
      commitDate: new Date(parseInt(commitDate) * 1000),
    };
  }

  /**
   * Create a backup branch
   */
  async createBackupBranch(suffix: string = 'backup'): Promise<string> {
    const currentBranch = await this.getCurrentBranch();
    const timestamp = new Date().getTime();
    const backupBranch = `${currentBranch}-${suffix}-${timestamp}`;
    
    await this.exec(`git branch ${backupBranch}`);
    return backupBranch;
  }

  /**
   * Check if working tree is clean
   */
  async isWorkingTreeClean(): Promise<boolean> {
    const status = await this.exec('git status --porcelain');
    return status === '';
  }

  /**
   * Get commit message
   */
  async getCommitMessage(hash: string): Promise<string> {
    return await this.exec(`git log -1 --format="%B" ${hash}`);
  }

  /**
   * Amend the most recent commit
   */
  async amendHeadCommit(
    newMessage?: string,
    newAuthorDate?: Date,
    newCommitDate?: Date
  ): Promise<void> {
    let command = 'git commit --amend';

    if (newMessage) {
      command += ` -m "${newMessage.replace(/"/g, '\\"')}"`;
    } else {
      command += ' --no-edit';
    }

    const env: any = { ...process.env };

    if (newAuthorDate) {
      const dateStr = newAuthorDate.toISOString();
      command += ` --date="${dateStr}"`;
      env.GIT_COMMITTER_DATE = newCommitDate ? newCommitDate.toISOString() : dateStr;
    }

    await execAsync(command, {
      cwd: this.workspaceRoot,
      env,
    });
  }

  /**
   * Interactive rebase to edit older commit
   */
  async rebaseEditCommit(
    commitHash: string,
    newMessage?: string,
    newAuthorDate?: Date
  ): Promise<void> {
    // Create a temporary script for the rebase
    const tempScript = `
#!/bin/bash
export GIT_SEQUENCE_EDITOR="sed -i 's/^pick ${commitHash}/edit ${commitHash}/'"
git rebase -i ${commitHash}~1
`;

    // This is a simplified version - in production, you'd use a more robust approach
    // For now, we'll focus on HEAD commits for the webview implementation
    throw new Error('Rebase for non-HEAD commits requires interactive terminal');
  }

  /**
   * Get the position of a commit (1 = HEAD, 2 = HEAD~1, etc.)
   */
  async getCommitPosition(hash: string): Promise<number> {
    const output = await this.exec(`git rev-list HEAD`);
    const commits = output.split('\n');
    const position = commits.indexOf(hash);
    return position + 1;
  }

  /**
   * Check if a commit is HEAD
   */
  async isHeadCommit(hash: string): Promise<boolean> {
    const head = await this.exec('git rev-parse HEAD');
    return head === hash;
  }

  /**
   * Edit a commit via checkout and amend (for non-HEAD commits)
   */
  async editCommitViaCheckout(
    commitHash: string,
    newMessage?: string,
    newAuthorDate?: Date,
    newCommitDate?: Date
  ): Promise<void> {
    // This is a simplified approach for non-HEAD commits
    // In production, you'd use git rebase -i or git filter-branch
    // For now, we'll just handle HEAD commits properly
    throw new Error('Editing non-HEAD commits requires interactive rebase (not yet fully implemented)');
  }

  /**
   * Reset current branch to another branch
   */
  async resetToBranch(branchName: string): Promise<void> {
    await this.exec(`git reset --hard ${branchName}`);
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchName: string): Promise<void> {
    await this.exec(`git branch -D ${branchName}`);
  }

  /**
   * Get all branches
   */
  async getAllBranches(): Promise<string[]> {
    const output = await this.exec('git branch --list');
    return output
      .split('\n')
      .map(line => line.replace('*', '').trim())
      .filter(line => line.length > 0);
  }
}

/**
 * Git commit information
 */
export interface GitCommitInfo {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  email: string;
  authorDate: Date;
  commitDate: Date;
}

/**
 * Detailed commit information
 */
export interface CommitDetails {
  hash: string;
  subject: string;
  body: string;
  author: string;
  authorEmail: string;
  authorDate: Date;
  committer: string;
  committerEmail: string;
  commitDate: Date;
}

