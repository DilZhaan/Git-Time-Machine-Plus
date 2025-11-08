import * as vscode from 'vscode';
import { Git, GitCommitInfo } from '../../lib/git';

/**
 * Service for performing safety checks before commit operations
 * Ensures operations are safe and user is aware of risks
 */
export class SafetyCheckService {
  constructor(private readonly git: Git) {}

  /**
   * Check if a single commit is safe to edit
   * @returns true if safe, false if user cancelled
   */
  async checkCommitSafety(commit: GitCommitInfo): Promise<boolean> {
    // Check if commit exists on remote
    const isOnRemote = await this.git.commitExistsOnRemote(commit.hash);
    if (isOnRemote) {
      await vscode.window.showErrorMessage(
        `⚠️ Warning: Commit ${commit.shortHash} exists on remote! Cannot edit safely. Aborting.`,
        { modal: true }
      );
      return false;
    }

    return this.checkWorkingTree();
  }

  /**
   * Check if multiple commits are safe to edit
   * @returns true if safe, false if user cancelled
   */
  async checkMultipleCommitsSafety(commits: GitCommitInfo[]): Promise<boolean> {
    // Check if any commit exists on remote
    for (const commit of commits) {
      const isOnRemote = await this.git.commitExistsOnRemote(commit.hash);
      if (isOnRemote) {
        await vscode.window.showErrorMessage(
          `⚠️ Warning: Commit ${commit.shortHash} exists on remote! Cannot edit safely. Aborting.`,
          { modal: true }
        );
        return false;
      }
    }

    return this.checkWorkingTree();
  }

  /**
   * Check if working tree is clean
   * Prompts user if there are uncommitted changes
   * @returns true if clean or user accepts to continue, false if user cancels
   */
  private async checkWorkingTree(): Promise<boolean> {
    const isClean = await this.git.isWorkingTreeClean();
    
    if (!isClean) {
      const proceed = await vscode.window.showWarningMessage(
        "You have uncommitted changes. It's recommended to commit or stash them first. Continue anyway?",
        { modal: true },
        'Continue',
        'Cancel'
      );
      
      return proceed === 'Continue';
    }

    return true;
  }

  /**
   * Verify that there are unpushed commits
   * Shows appropriate message if none found
   * @returns true if commits exist, false otherwise
   */
  async verifyUnpushedCommitsExist(commits: GitCommitInfo[]): Promise<boolean> {
    if (!commits || commits.length === 0) {
      await vscode.window.showInformationMessage('No unpushed commits found.');
      return false;
    }
    return true;
  }
}

