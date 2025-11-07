import * as vscode from 'vscode';

/**
 * Type-safe webview messaging
 */

export interface WebviewMessage<T = any> {
  command: string;
  data?: T;
}

export interface DateTimeMessage {
  command: 'confirm' | 'cancel';
  authorDate?: string;
  commitDate?: string;
}

export interface SummaryMessage {
  command: 'confirm' | 'cancel';
}

/**
 * Webview message handler with type safety
 */
export class WebviewMessaging {
  /**
   * Create a typed message handler
   */
  static createHandler<T extends WebviewMessage>(
    panel: vscode.WebviewPanel,
    handlers: Record<string, ((data: any) => void | Promise<void>) | undefined>
  ): vscode.Disposable {
    return panel.webview.onDidReceiveMessage(async (message: T) => {
      const handler = handlers[message.command];
      if (handler) {
        await handler(message.data);
      }
    });
  }

  /**
   * Post message to webview with type safety
   */
  static postMessage<T = any>(panel: vscode.WebviewPanel, command: string, data?: T): void {
    panel.webview.postMessage({ command, data });
  }

  /**
   * Create a promise-based message handler
   */
  static createPromiseHandler<T>(
    panel: vscode.WebviewPanel,
    successCommand: string,
    cancelCommand: string
  ): Promise<T | undefined> {
    return new Promise((resolve) => {
      const disposable = panel.webview.onDidReceiveMessage((message: WebviewMessage<T>) => {
        if (message.command === successCommand) {
          disposable.dispose();
          resolve(message.data);
        } else if (message.command === cancelCommand) {
          disposable.dispose();
          resolve(undefined);
        }
      });

      // Cleanup on panel disposal
      panel.onDidDispose(() => {
        disposable.dispose();
        resolve(undefined);
      });
    });
  }
}

/**
 * Webview content security
 */
export class WebviewSecurity {
  /**
   * Get nonce for CSP
   */
  static getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * Get Content Security Policy
   */
  static getCSP(nonce: string): string {
    return `
      default-src 'none';
      style-src https://cdn.tailwindcss.com https://cdn.jsdelivr.net 'unsafe-inline';
      script-src https://cdn.tailwindcss.com https://cdn.jsdelivr.net 'nonce-${nonce}';
      img-src vscode-resource: https:;
      font-src https://cdn.jsdelivr.net;
    `.replace(/\s+/g, ' ').trim();
  }
}

