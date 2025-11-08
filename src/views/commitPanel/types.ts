/**
 * Types and interfaces for commit panel
 */

export interface CommitDisplayInfo {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  authorEmail: string;
  authorDate: string;
  commitDate: string;
  relativeDate: string;
}

export interface EditInfo {
  hash: string;
  newMessage?: string;
  newAuthorDate?: string;
  newCommitDate?: string;
}

export interface WebviewMessage {
  type: string;
  [key: string]: any;
}

export interface UnpushedCommitsData {
  commits: CommitDisplayInfo[];
  remoteBranch: string | null;
  currentBranch: string | null;
}

