/**
 * Handler for webview messages
 * Follows Single Responsibility Principle
 */

import * as vscode from 'vscode';
import { WebviewMessage, EditInfo } from './types';

export interface IWebviewMessageDelegate {
  onRefresh(): Promise<void>;
  onSearch(query: string): void;
  onEditCommit(hash: string): Promise<void>;
  onSaveEdit(edit: EditInfo): Promise<void>;
  onCancelEdit(hash: string): void;
  onBulkEditStart(hashes: string[]): Promise<void>;
  onApplyAllEdits(edits: EditInfo[]): Promise<void>;
  onOpenInSidebar(): void;
}

export class WebviewMessageHandler {
  constructor(private delegate: IWebviewMessageDelegate) {}

  /**
   * Handle incoming message from webview
   */
  public async handleMessage(message: WebviewMessage): Promise<void> {
    switch (message.type) {
      case 'refresh':
        await this.delegate.onRefresh();
        break;

      case 'search':
        this.delegate.onSearch(message.query);
        break;

      case 'editCommit':
        await this.delegate.onEditCommit(message.hash);
        break;

      case 'saveEdit':
        await this.delegate.onSaveEdit(message.edit);
        break;

      case 'cancelEdit':
        this.delegate.onCancelEdit(message.hash);
        break;

      case 'bulkEditStart':
        await this.delegate.onBulkEditStart(message.hashes);
        break;

      case 'applyAllEdits':
        await this.delegate.onApplyAllEdits(message.edits);
        break;

      case 'openInSidebar':
        this.delegate.onOpenInSidebar();
        break;

      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Create message handler for webview
   */
  public static createHandler(
    delegate: IWebviewMessageDelegate
  ): (message: WebviewMessage) => Promise<void> {
    const handler = new WebviewMessageHandler(delegate);
    return (message: WebviewMessage) => handler.handleMessage(message);
  }
}

