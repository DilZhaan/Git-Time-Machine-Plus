/**
 * Main builder for commit panel HTML
 * Follows Single Responsibility Principle - coordinates other builders
 * Follows Open/Closed Principle - open for extension, closed for modification
 */

import * as vscode from 'vscode';
import {
  StyleBuilder,
  HtmlTemplateBuilder,
  WebviewScriptBuilder
} from './';

export class CommitPanelHtmlBuilder {
  private readonly styleBuilder: StyleBuilder;
  private readonly templateBuilder: HtmlTemplateBuilder;
  private readonly scriptBuilder: WebviewScriptBuilder;

  constructor(private extensionUri: vscode.Uri) {
    this.styleBuilder = new StyleBuilder();
    this.templateBuilder = new HtmlTemplateBuilder();
    this.scriptBuilder = new WebviewScriptBuilder();
  }

  /**
   * Generate complete HTML for the webview
   */
  public buildHtml(webview: vscode.Webview): string {
    const codiconsUri = this.getCodiconsUri(webview);
    const toolkitUri = this.getToolkitUri(webview);
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      ${this.buildHead(webview, codiconsUri, toolkitUri, nonce)}
      ${this.styleBuilder.buildStyles()}
    </head>
    <body>
      ${this.templateBuilder.buildBody()}
      ${this.scriptBuilder.buildScript(nonce)}
    </body>
    </html>`;
  }

  /**
   * Build HTML head section
   */
  private buildHead(
    webview: vscode.Webview,
    codiconsUri: vscode.Uri,
    toolkitUri: vscode.Uri,
    nonce: string
  ): string {
    return `
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
        style-src ${webview.cspSource} 'unsafe-inline'; 
        script-src 'nonce-${nonce}' ${webview.cspSource}; 
        font-src ${webview.cspSource} data:;
        img-src ${webview.cspSource} https:;">
      <link href="${codiconsUri}" rel="stylesheet" />
      <script nonce="${nonce}" type="module" src="${toolkitUri}"></script>
      <title>Git Time Machine Plus</title>
    `;
  }

  /**
   * Get codicons URI
   */
  private getCodiconsUri(webview: vscode.Webview): vscode.Uri {
    return webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        'node_modules',
        '@vscode/codicons',
        'dist',
        'codicon.css'
      )
    );
  }

  /**
   * Get webview UI toolkit URI
   */
  private getToolkitUri(webview: vscode.Webview): vscode.Uri {
    return webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        'node_modules',
        '@vscode/webview-ui-toolkit',
        'dist',
        'toolkit.min.js'
      )
    );
  }

  /**
   * Generate a nonce for inline scripts
   */
  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}

