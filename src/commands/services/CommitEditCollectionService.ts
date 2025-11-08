import * as vscode from 'vscode';
import { Git, GitCommitInfo } from '../../lib/git';
import { DateTimeWebview } from '../../webview/dateTimeWebview';
import { CommitEditInfo } from '../types';

/**
 * Service for collecting edit information from user
 * Handles UI interactions to gather commit edit details
 */
export class CommitEditCollectionService {
  constructor(
    private readonly git: Git,
    private readonly context: vscode.ExtensionContext
  ) {}

  /**
   * Collect edit information for a single commit
   * Prompts user for message and timestamp changes
   */
  async collectEditForCommit(commit: GitCommitInfo): Promise<CommitEditInfo> {
    const edit: CommitEditInfo = { commit };

    // Ask: Edit message?
    const shouldEditMessage = await this.askYesNo(
      `Edit message for ${commit.shortHash}?`,
      commit.subject
    );

    if (shouldEditMessage) {
      edit.newMessage = await this.promptForNewMessage(commit);
    }

    // Ask: Edit timestamp?
    const shouldEditTimestamp = await this.askYesNo(
      `Edit timestamp for ${commit.shortHash}?`,
      `Current: ${this.formatDate(commit.authorDate)}`
    );

    if (shouldEditTimestamp) {
      const dates = await this.promptForNewDates(commit);
      if (dates) {
        edit.newAuthorDate = dates.authorDate;
        edit.newCommitDate = dates.commitDate;
      }
    }

    return edit;
  }

  /**
   * Collect edits for multiple commits
   * Shows progress for each commit being edited
   */
  async collectEditsForCommits(commits: GitCommitInfo[]): Promise<CommitEditInfo[]> {
    const edits: CommitEditInfo[] = [];

    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];

      await vscode.window.showInformationMessage(
        `Editing commit ${i + 1} of ${commits.length}: ${commit.shortHash}`
      );

      const edit = await this.collectEditForCommit(commit);

      // Only add to edits if there are actual changes
      if (edit.newMessage || edit.newAuthorDate || edit.newCommitDate) {
        edits.push(edit);
      }
    }

    return edits;
  }

  /**
   * Prompt user for new commit message
   */
  private async promptForNewMessage(commit: GitCommitInfo): Promise<string | undefined> {
    const currentMessage = await this.git.getCommitMessage(commit.hash);
    
    return await vscode.window.showInputBox({
      prompt: `Enter new message for ${commit.shortHash}`,
      value: currentMessage,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Commit message cannot be empty';
        }
        return null;
      },
    });
  }

  /**
   * Prompt user for new dates using webview
   */
  private async promptForNewDates(
    commit: GitCommitInfo
  ): Promise<{ authorDate: Date; commitDate: Date } | undefined> {
    const webview = new DateTimeWebview(this.context, commit);
    return await webview.show();
  }

  /**
   * Ask a yes/no question
   */
  private async askYesNo(question: string, detail?: string): Promise<boolean> {
    const choice = await vscode.window.showQuickPick(
      [
        { label: '✓ Yes', value: true },
        { label: '✗ No', value: false },
      ],
      {
        placeHolder: question,
        title: detail,
      }
    );
    return choice?.value ?? false;
  }

  /**
   * Ask if user wants to edit message
   */
  async askEditMessage(): Promise<boolean> {
    const choice = await vscode.window.showQuickPick(
      [
        { label: '✏️ Yes, edit message', value: true },
        { label: '⏭️ No, keep current message', value: false },
      ],
      {
        placeHolder: 'Do you want to edit the commit message?',
      }
    );
    return choice?.value ?? false;
  }

  /**
   * Ask if user wants to edit timestamp
   */
  async askEditTimestamp(): Promise<boolean> {
    const choice = await vscode.window.showQuickPick(
      [
        { label: '📅 Yes, edit timestamp', value: true },
        { label: '⏭️ No, keep current timestamp', value: false },
      ],
      {
        placeHolder: 'Do you want to edit the commit timestamp?',
      }
    );
    return choice?.value ?? false;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleString();
  }
}

