import { GitCommitInfo } from '../lib/git';

/**
 * Edit information for a single commit
 */
export interface CommitEditInfo {
  commit: GitCommitInfo;
  newMessage?: string;
  newAuthorDate?: Date;
  newCommitDate?: Date;
}

