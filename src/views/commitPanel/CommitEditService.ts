/**
 * Service for handling commit edit operations
 * Follows Single Responsibility Principle
 */

import * as vscode from 'vscode';
import { GitService } from '../../git/gitService';
import { GitCommit } from '../../types';
import { EditInfo } from './types';

export class CommitEditService {
  constructor(private gitService: GitService) {}

  /**
   * Apply single commit edit
   */
  public async applySingleEdit(
    edit: EditInfo,
    commits: GitCommit[]
  ): Promise<void> {
    const commit = commits.find(c => c.hash === edit.hash);
    if (!commit) {
      throw new Error('Commit not found');
    }

    const hasMessageEdit = edit.newMessage && edit.newMessage !== commit.message;
    const hasTimestampEdit = edit.newAuthorDate || edit.newCommitDate;

    // Store original message and position to track commit after rebase
    const originalMessage = commit.message;
    const commitIndex = commits.findIndex(c => c.hash === edit.hash);

    // If editing both, we need to do it carefully
    if (hasMessageEdit && hasTimestampEdit && edit.newMessage) {
      await this.editBothMessageAndTimestamp(
        commit,
        edit,
        originalMessage,
        commitIndex
      );
    } else if (hasMessageEdit && edit.newMessage) {
      // Only message edit
      await this.gitService.editCommitMessage(commit.hash, edit.newMessage);
    } else if (hasTimestampEdit) {
      // Only timestamp edit
      const newDate = edit.newAuthorDate ? new Date(edit.newAuthorDate) : commit.date;
      await this.gitService.editCommitTimestamp(commit.hash, newDate);
    }
  }

  /**
   * Apply bulk edits to multiple commits
   */
  public async applyBulkEdits(
    edits: EditInfo[],
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    // Apply edits in chronological order (oldest first)
    const sortedEdits = [...edits].reverse();

    for (let i = 0; i < sortedEdits.length; i++) {
      const edit = sortedEdits[i];

      // Refresh commits to get current hashes after previous edits
      const result = await this.gitService.getUnpushedCommits();
      const commits = result.commits;

      const commit = commits.find(c => c.hash === edit.hash);

      if (!commit) {
        // If commit not found by hash, try finding by position
        const commitByPosition = commits[sortedEdits.length - 1 - i];
        if (!commitByPosition) {
          continue;
        }
      }

      const targetCommit = commit || commits[sortedEdits.length - 1 - i];
      if (!targetCommit) {
        continue;
      }

      await this.applyEditToCommit(edit, targetCommit, result.commits);

      // Report progress
      if (onProgress) {
        onProgress(i + 1, sortedEdits.length);
      }
    }
  }

  /**
   * Apply edit to a specific commit
   */
  private async applyEditToCommit(
    edit: EditInfo,
    targetCommit: GitCommit,
    allCommits: GitCommit[]
  ): Promise<void> {
    // Store original message and position to track commit after rebase
    const originalMessage = targetCommit.message;
    const targetIndex = allCommits.findIndex(c => c.hash === targetCommit.hash);

    const hasMessageEdit = edit.newMessage && edit.newMessage !== targetCommit.message;
    const hasTimestampEdit = edit.newAuthorDate || edit.newCommitDate;

    // Apply both edits for this commit
    if (hasMessageEdit && hasTimestampEdit && edit.newMessage) {
      await this.editBothMessageAndTimestampForBulk(
        targetCommit,
        edit,
        originalMessage,
        targetIndex
      );
    } else if (hasMessageEdit && edit.newMessage) {
      await this.gitService.editCommitMessage(targetCommit.hash, edit.newMessage);
    } else if (hasTimestampEdit) {
      const newDate = edit.newAuthorDate ? new Date(edit.newAuthorDate) : targetCommit.date;
      await this.gitService.editCommitTimestamp(targetCommit.hash, newDate);
    }
  }

  /**
   * Edit both message and timestamp for a single commit
   */
  private async editBothMessageAndTimestamp(
    commit: GitCommit,
    edit: EditInfo,
    originalMessage: string,
    commitIndex: number
  ): Promise<void> {
    // Edit timestamp first, then message
    const newDate = edit.newAuthorDate ? new Date(edit.newAuthorDate) : commit.date;
    await this.gitService.editCommitTimestamp(commit.hash, newDate);

    // After timestamp edit, find the commit by its original message or position
    const result = await this.gitService.getUnpushedCommits();

    // Try to find by original message first
    let updatedCommit = result.commits.find(c => c.message === originalMessage);

    // If not found by message, use position (in case message is changing)
    if (!updatedCommit && commitIndex >= 0 && commitIndex < result.commits.length) {
      updatedCommit = result.commits[commitIndex];
    }

    if (updatedCommit && edit.newMessage) {
      await this.gitService.editCommitMessage(updatedCommit.hash, edit.newMessage);
    }
  }

  /**
   * Edit both message and timestamp for bulk operation
   */
  private async editBothMessageAndTimestampForBulk(
    targetCommit: GitCommit,
    edit: EditInfo,
    originalMessage: string,
    targetIndex: number
  ): Promise<void> {
    // Edit timestamp first, then message
    const newDate = edit.newAuthorDate ? new Date(edit.newAuthorDate) : targetCommit.date;
    await this.gitService.editCommitTimestamp(targetCommit.hash, newDate);

    // Get updated hash after timestamp edit - find by original message or position
    const updated = await this.gitService.getUnpushedCommits();

    // Try to find by original message first
    let updatedCommit = updated.commits.find(c => c.message === originalMessage);

    // If not found, use position
    if (!updatedCommit && targetIndex >= 0 && targetIndex < updated.commits.length) {
      updatedCommit = updated.commits[targetIndex];
    }

    if (updatedCommit && edit.newMessage) {
      await this.gitService.editCommitMessage(updatedCommit.hash, edit.newMessage);
    }
  }
}

