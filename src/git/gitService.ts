import { GitCommit, UnpushedCommitsResult } from '../types';
import { GitCommandExecutor } from './utils/GitCommandExecutor';
import { GitBranchService } from './services/GitBranchService';
import { GitCommitService } from './services/GitCommitService';
import { GitEditService } from './services/GitEditService';
import { GitRebaseService } from './services/GitRebaseService';

/**
 * Facade service for interacting with Git repositories
 * Orchestrates multiple specialized services following SOLID principles
 * 
 * Architecture:
 * - GitCommandExecutor: Centralized command execution with error handling
 * - GitBranchService: Branch-related operations
 * - GitCommitService: Commit retrieval and queries
 * - GitRebaseService: Rebase operations
 * - GitEditService: High-level commit editing operations
 */
export class GitService {
  private readonly executor: GitCommandExecutor;
  private readonly branchService: GitBranchService;
  private readonly commitService: GitCommitService;
  private readonly editService: GitEditService;

  constructor(workspaceRoot: string) {
    // Initialize services with dependency injection
    this.executor = new GitCommandExecutor(workspaceRoot);
    this.branchService = new GitBranchService(this.executor);
    this.commitService = new GitCommitService(this.executor, this.branchService);
    
    const rebaseService = new GitRebaseService(this.executor);
    this.editService = new GitEditService(
      this.executor,
      this.commitService,
      rebaseService
    );
  }

  // ==================== Delegation Methods ====================
  // These methods delegate to specialized services, providing a unified interface

  /**
   * Get the current branch name
   */
  async getCurrentBranch(): Promise<string | null> {
    return this.branchService.getCurrentBranch();
  }

  /**
   * Get the remote tracking branch for the current branch
   */
  async getRemoteBranch(branch: string): Promise<string | null> {
    return this.branchService.getRemoteBranch(branch);
  }

  /**
   * Check if a remote branch exists
   */
  async remoteExists(remoteBranch: string): Promise<boolean> {
    return this.branchService.remoteExists(remoteBranch);
  }

  /**
   * Get unpushed commits from the current branch
   */
  async getUnpushedCommits(): Promise<UnpushedCommitsResult> {
    return this.commitService.getUnpushedCommits();
  }

  /**
   * Edit a commit message
   */
  async editCommitMessage(commitHash: string, newMessage: string): Promise<void> {
    return this.editService.editCommitMessage(commitHash, newMessage);
  }

  /**
   * Edit a commit timestamp
   */
  async editCommitTimestamp(commitHash: string, newDate: Date): Promise<void> {
    return this.editService.editCommitTimestamp(commitHash, newDate);
  }

  /**
   * Check if the repository has uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    return this.commitService.hasUncommittedChanges();
  }

  /**
   * Verify that a commit is safe to edit (not pushed)
   */
  async isCommitSafeToEdit(commitHash: string): Promise<boolean> {
    return this.commitService.isCommitSafeToEdit(commitHash);
  }
}

