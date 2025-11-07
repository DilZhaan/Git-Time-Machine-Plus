/**
 * Represents a Git commit with its metadata
 */
export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  authorEmail: string;
  date: Date;
  timestamp: number;
  isPushed: boolean;
}

/**
 * Result of detecting unpushed commits
 */
export interface UnpushedCommitsResult {
  commits: GitCommit[];
  currentBranch: string;
  remoteBranch: string | null;
  hasRemote: boolean;
}

