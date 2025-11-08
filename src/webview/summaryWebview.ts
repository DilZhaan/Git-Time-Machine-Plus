import * as vscode from 'vscode';
import { CommitEditInfo } from '../commands/types';

/**
 * Enhanced summary webview with animations and progress
 */
export class SummaryWebview {
  private panel: vscode.WebviewPanel | null = null;
  private resolvePromise: ((value: boolean) => void) | null = null;

  constructor(
    private context: vscode.ExtensionContext,
    private edits: CommitEditInfo[]
  ) {}

  /**
   * Show the summary and return user confirmation
   */
  async show(): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;

      this.panel = vscode.window.createWebviewPanel(
        'gitTimeMachineSummary',
        'Confirm Changes',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      this.panel.webview.html = this.getHtmlContent();

      // Handle messages from webview
      this.panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case 'confirm':
              this.resolvePromise?.(true);
              this.showProgressAnimation();
              break;
            case 'cancel':
              this.resolvePromise?.(false);
              this.panel?.dispose();
              break;
          }
        },
        undefined,
        this.context.subscriptions
      );

      // Handle panel closure
      this.panel.onDidDispose(() => {
        this.resolvePromise?.(false);
        this.panel = null;
      });
    });
  }

  /**
   * Show progress animation
   */
  private showProgressAnimation(): void {
    if (!this.panel) {
      return;
    }

    this.panel.webview.html = this.getProgressHtml();

    // Auto-close after a delay
    setTimeout(() => {
      this.panel?.dispose();
    }, 2000);
  }

  /**
   * Generate progress HTML
   */
  private getProgressHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Processing...</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background: #1e1e1e;
      color: #cccccc;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    .pulse {
      animation: pulse 2s ease-in-out infinite;
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center">
  <div class="text-center fade-in">
    <svg class="spinner mx-auto mb-4" width="64" height="64" fill="none" stroke="#007acc" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <h2 class="text-2xl font-bold mb-2">Rewriting History...</h2>
    <p class="text-gray-400 pulse">Applying changes to ${this.edits.length} commit(s)</p>
  </div>
</body>
</html>`;
  }

  /**
   * Generate enhanced HTML with animations
   */
  private getHtmlContent(): string {
    const tableRows = this.edits.map((edit, index) => {
      const changes: string[] = [];
      
      if (edit.newMessage) {
        changes.push(`<span class="text-blue-400">Message</span>`);
      }
      if (edit.newAuthorDate) {
        changes.push(`<span class="text-green-400">Author Date</span>`);
      }
      if (edit.newCommitDate) {
        changes.push(`<span class="text-green-400">Commit Date</span>`);
      }

      const changesText = changes.length > 0 ? changes.join(', ') : '<span class="text-gray-500">No changes</span>';

      return `
        <tr class="border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200 fade-in-row" style="animation-delay: ${index * 0.05}s">
          <td class="py-3 px-4">${index + 1}</td>
          <td class="py-3 px-4 font-mono text-yellow-400">${edit.commit.shortHash}</td>
          <td class="py-3 px-4 text-sm">${this.escapeHtml(edit.commit.subject.substring(0, 60))}${edit.commit.subject.length > 60 ? '...' : ''}</td>
          <td class="py-3 px-4">${changesText}</td>
        </tr>
      `;
    }).join('');

    const detailsRows = this.edits.map((edit, index) => {
      const details: string[] = [];

      if (edit.newMessage) {
        details.push(`
          <div class="mb-4 fade-in-row" style="animation-delay: ${index * 0.1}s">
            <div class="text-sm font-semibold text-gray-400 mb-1 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Message Change:
            </div>
            <div class="bg-red-900 bg-opacity-30 px-3 py-2 rounded text-red-300 mb-1 transition-all duration-200 hover:bg-opacity-40">
              <span class="text-xs mr-2">-</span>${this.escapeHtml(edit.commit.subject)}
            </div>
            <div class="bg-green-900 bg-opacity-30 px-3 py-2 rounded text-green-300 transition-all duration-200 hover:bg-opacity-40">
              <span class="text-xs mr-2">+</span>${this.escapeHtml(edit.newMessage)}
            </div>
          </div>
        `);
      }

      if (edit.newAuthorDate) {
        details.push(`
          <div class="mb-4 fade-in-row" style="animation-delay: ${index * 0.1 + 0.05}s">
            <div class="text-sm font-semibold text-gray-400 mb-1 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Author Date:
            </div>
            <div class="bg-red-900 bg-opacity-30 px-3 py-2 rounded text-red-300 mb-1 transition-all duration-200 hover:bg-opacity-40">
              <span class="text-xs mr-2">-</span>${edit.commit.authorDate.toLocaleString()}
            </div>
            <div class="bg-green-900 bg-opacity-30 px-3 py-2 rounded text-green-300 transition-all duration-200 hover:bg-opacity-40">
              <span class="text-xs mr-2">+</span>${edit.newAuthorDate.toLocaleString()}
            </div>
          </div>
        `);
      }

      if (edit.newCommitDate) {
        details.push(`
          <div class="mb-4 fade-in-row" style="animation-delay: ${index * 0.1 + 0.1}s">
            <div class="text-sm font-semibold text-gray-400 mb-1 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Commit Date:
            </div>
            <div class="bg-red-900 bg-opacity-30 px-3 py-2 rounded text-red-300 mb-1 transition-all duration-200 hover:bg-opacity-40">
              <span class="text-xs mr-2">-</span>${edit.commit.commitDate.toLocaleString()}
            </div>
            <div class="bg-green-900 bg-opacity-30 px-3 py-2 rounded text-green-300 transition-all duration-200 hover:bg-opacity-40">
              <span class="text-xs mr-2">+</span>${edit.newCommitDate.toLocaleString()}
            </div>
          </div>
        `);
      }

      if (details.length === 0) {
        return '';
      }

      return `
        <div class="mb-6 bg-gray-800 rounded-lg p-4 hover-card fade-in-row" style="animation-delay: ${index * 0.1}s">
          <div class="text-lg font-semibold mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
            </svg>
            <span class="text-yellow-400 font-mono mr-2">${edit.commit.shortHash}</span>
            <span class="text-gray-400">-</span>
            <span class="text-gray-300 ml-2 text-sm">${this.escapeHtml(edit.commit.subject.substring(0, 50))}${edit.commit.subject.length > 50 ? '...' : ''}</span>
          </div>
          ${details.join('')}
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Changes</title>
  
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    :root {
      --bg-primary: #1e1e1e;
      --bg-secondary: #252526;
      --bg-tertiary: #2d2d30;
      --text-primary: #cccccc;
      --text-secondary: #969696;
      --border-color: #3c3c3c;
    }

    @media (prefers-color-scheme: light) {
      :root {
        --bg-primary: #ffffff;
        --bg-secondary: #f3f3f3;
        --bg-tertiary: #e8e8e8;
        --text-primary: #333333;
        --text-secondary: #666666;
        --border-color: #d4d4d4;
      }
    }

    body {
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    .fade-in-row {
      animation: fadeIn 0.5s ease-out;
      opacity: 0;
      animation-fill-mode: forwards;
    }

    .slide-in {
      animation: slideIn 0.5s ease-out;
    }

    .scale-in {
      animation: scaleIn 0.3s ease-out;
    }

    .stat-card {
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }

    .hover-card {
      transition: all 0.3s ease;
    }

    .hover-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .btn {
      transition: all 0.3s ease;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
  </style>
</head>
<body class="p-8 min-h-screen">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="fade-in mb-8">
      <div class="flex items-center mb-2">
        <svg class="w-8 h-8 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1 class="text-3xl font-bold">Confirm Changes</h1>
      </div>
      <p class="text-secondary">
        Review all changes before applying. This will rewrite git history.
      </p>
    </div>

    <!-- Summary Statistics -->
    <div class="grid grid-cols-3 gap-4 mb-8 slide-in">
      <div class="stat-card bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
        <div class="text-4xl font-bold text-blue-400 mb-2">${this.edits.length}</div>
        <div class="text-sm text-gray-400 flex items-center justify-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
          </svg>
          Commits to Edit
        </div>
      </div>
      <div class="stat-card bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
        <div class="text-4xl font-bold text-green-400 mb-2">${this.countChanges('message')}</div>
        <div class="text-sm text-gray-400 flex items-center justify-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Message Changes
        </div>
      </div>
      <div class="stat-card bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
        <div class="text-4xl font-bold text-yellow-400 mb-2">${this.countChanges('timestamp')}</div>
        <div class="text-sm text-gray-400 flex items-center justify-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Timestamp Changes
        </div>
      </div>
    </div>

    <!-- Summary Table -->
    <div class="bg-gray-900 rounded-lg overflow-hidden mb-8 scale-in border border-gray-800">
      <div class="px-6 py-4 bg-gray-800 border-b border-gray-700">
        <h2 class="text-xl font-semibold flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Summary Table
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-800">
            <tr class="text-left text-gray-400 text-sm">
              <th class="py-3 px-4 w-12">#</th>
              <th class="py-3 px-4 w-32">Hash</th>
              <th class="py-3 px-4">Subject</th>
              <th class="py-3 px-4 w-48">Changes</th>
            </tr>
          </thead>
          <tbody class="text-white">
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detailed Changes -->
    <div class="mb-8">
      <div class="px-6 py-4 bg-gray-800 rounded-t-lg border-b border-gray-700">
        <h2 class="text-xl font-semibold flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Detailed Changes
        </h2>
      </div>
      <div class="bg-gray-900 rounded-b-lg p-6 border-x border-b border-gray-800">
        ${detailsRows}
      </div>
    </div>

    <!-- Warning -->
    <div class="mb-6 p-4 rounded-lg border fade-in" style="background: rgba(249, 168, 37, 0.1); border-color: rgba(249, 168, 37, 0.3)">
      <p class="text-sm flex items-start">
        <svg class="w-5 h-5 mr-2 flex-shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span><strong>Warning:</strong> This will rewrite git history for ${this.edits.length} commit(s). 
        A backup branch has been created. You can undo these changes later.</span>
      </p>
    </div>

    <!-- Actions -->
    <div class="flex gap-4 fade-in">
      <button
        id="confirmBtn"
        class="btn flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span id="confirmText">Confirm and Apply Changes</span>
      </button>
      <button
        id="cancelBtn"
        class="btn flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Cancel
      </button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    document.getElementById('confirmBtn').addEventListener('click', () => {
      const btn = document.getElementById('confirmBtn');
      const text = document.getElementById('confirmText');
      
      btn.disabled = true;
      btn.classList.add('opacity-50');
      text.innerHTML = '<svg class="animate-spin w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...';
      
      vscode.postMessage({ command: 'confirm' });
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
      vscode.postMessage({ command: 'cancel' });
    });
  </script>
</body>
</html>`;
  }

  /**
   * Count changes by type
   */
  private countChanges(type: 'message' | 'timestamp'): number {
    if (type === 'message') {
      return this.edits.filter(e => e.newMessage).length;
    } else {
      return this.edits.filter(e => e.newAuthorDate || e.newCommitDate).length;
    }
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Dispose the webview
   */
  dispose(): void {
    this.panel?.dispose();
  }
}
