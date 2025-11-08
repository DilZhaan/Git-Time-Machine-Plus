/**
 * Main coordinator for commit panel view
 * Follows Single Responsibility Principle - delegates to specialized services
 */

import * as vscode from 'vscode';
import { GitService } from '../../git/gitService';
import { GitCommit } from '../../types';
import { CommitDisplayInfo, EditInfo, UnpushedCommitsData } from './types';
import { CommitDisplayMapper } from './CommitDisplayMapper';
import { CommitEditService } from './CommitEditService';
import { WebviewMessageHandler, IWebviewMessageDelegate } from './WebviewMessageHandler';
import { CommitPanelHtmlBuilder } from './builders/CommitPanelHtmlBuilder';

/**
 * Commit Panel View Provider
 * Thin coordinator that delegates to specialized services
 */
export class CommitPanelView implements vscode.WebviewViewProvider, IWebviewMessageDelegate {
  private _view?: vscode.WebviewView;
  private commits: GitCommit[] = [];
  
  // Specialized services
  private readonly displayMapper: CommitDisplayMapper;
  private readonly editService: CommitEditService;
  private readonly htmlBuilder: CommitPanelHtmlBuilder;
  private readonly messageHandler: WebviewMessageHandler;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly gitService: GitService
  ) {
    // Initialize services
    this.displayMapper = new CommitDisplayMapper();
    this.editService = new CommitEditService(gitService);
    this.htmlBuilder = new CommitPanelHtmlBuilder(extensionUri);
    this.messageHandler = new WebviewMessageHandler(this);
  }

  /**
   * VSCode calls this to resolve the webview
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    // Configure webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this.extensionUri,
        vscode.Uri.joinPath(this.extensionUri, 'node_modules', '@vscode/codicons')
      ]
    };

    // Set HTML content
    webviewView.webview.html = this.htmlBuilder.buildHtml(webviewView.webview);

    // Handle messages
    webviewView.webview.onDidReceiveMessage(async (message) => {
      await this.messageHandler.handleMessage(message);
    });

    // Initial load
    this.refresh();
  }

  /**
   * Refresh commit list
   */
  public async refresh(): Promise<void> {
    try {
      const result = await this.gitService.getUnpushedCommits();
      this.commits = result.commits;

      if (this._view) {
        this.postMessage({
          type: 'commitsLoaded',
          commits: this.displayMapper.toDisplayInfoList(this.commits),
          remoteBranch: result.remoteBranch,
          currentBranch: result.currentBranch
        });
      }
    } catch (error: any) {
      this.postErrorMessage(error.message || 'Failed to load commits');
    }
  }

  // ========== IWebviewMessageDelegate Implementation ==========

  public async onRefresh(): Promise<void> {
    await this.refresh();
  }

  public onSearch(query: string): void {
    const filtered = this.commits.filter(c =>
      c.message.toLowerCase().includes(query.toLowerCase()) ||
      c.author.toLowerCase().includes(query.toLowerCase()) ||
      c.hash.includes(query.toLowerCase())
    );

    if (this._view) {
      this.postMessage({
        type: 'commitsFiltered',
        commits: this.displayMapper.toDisplayInfoList(filtered)
      });
    }
  }

  public async onEditCommit(hash: string): Promise<void> {
    const commit = this.commits.find(c => c.hash === hash);
    if (!commit || !this._view) {
      return;
    }

    this.postMessage({
      type: 'editMode',
      commit: this.displayMapper.toDisplayInfo(commit)
    });
  }

  public async onSaveEdit(edit: EditInfo): Promise<void> {
    try {
      await this.editService.applySingleEdit(edit, this.commits);
      vscode.window.showInformationMessage('✅ Commit updated successfully!');
      await this.refresh();

      if (this._view) {
        this.postMessage({ type: 'editComplete' });
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to update commit: ${error.message}`);
    }
  }

  public onCancelEdit(hash: string): void {
    if (this._view) {
      this.postMessage({ type: 'editCancelled' });
    }
  }

  public async onBulkEditStart(hashes: string[]): Promise<void> {
    const selectedCommits = this.commits.filter(c => hashes.includes(c.hash));

    if (this._view) {
      this.postMessage({
        type: 'bulkEditMode',
        commits: this.displayMapper.toDisplayInfoList(selectedCommits)
      });
    }
  }

  public async onApplyAllEdits(edits: EditInfo[]): Promise<void> {
    if (this._view) {
      this.postMessage({
        type: 'applyingEdits',
        total: edits.length
      });
    }

    try {
      await this.editService.applyBulkEdits(edits, (current, total) => {
        if (this._view) {
          this.postMessage({
            type: 'editProgress',
            current,
            total
          });
        }
      });

      vscode.window.showInformationMessage(`✅ Successfully updated ${edits.length} commit(s)!`);
      await this.refresh();

      if (this._view) {
        this.postMessage({ type: 'bulkEditComplete' });
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to apply edits: ${error.message}`);
      if (this._view) {
        this.postMessage({
          type: 'editError',
          message: error.message
        });
      }
    }
  }

  public onOpenInSidebar(): void {
    vscode.commands.executeCommand('gitTimeMachine.focus');
  }

  // ========== Private Helpers ==========

  private postMessage(message: any): void {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  private postErrorMessage(message: string): void {
    if (this._view) {
      this.postMessage({
        type: 'error',
        message
      });
    }
  }
}

