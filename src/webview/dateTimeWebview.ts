import * as vscode from 'vscode';
import { GitCommitInfo } from '../lib/git';

/**
 * Enhanced webview for selecting date and time with animations and theme support
 */
export class DateTimeWebview {
  private panel: vscode.WebviewPanel | null = null;
  private resolvePromise: ((value: { authorDate: Date; commitDate: Date } | undefined) => void) | null = null;

  constructor(
    private context: vscode.ExtensionContext,
    private commit: GitCommitInfo
  ) {}

  /**
   * Show the webview and return selected dates
   */
  async show(): Promise<{ authorDate: Date; commitDate: Date } | undefined> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;

      this.panel = vscode.window.createWebviewPanel(
        'gitTimeMachineDatePicker',
        'Edit Commit Timestamp',
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
              const authorDate = new Date(message.authorDate);
              const commitDate = new Date(message.commitDate);
              this.resolvePromise?.({ authorDate, commitDate });
              this.panel?.dispose();
              break;
            case 'cancel':
              this.resolvePromise?.(undefined);
              this.panel?.dispose();
              break;
          }
        },
        undefined,
        this.context.subscriptions
      );

      // Handle panel closure
      this.panel.onDidDispose(() => {
        this.resolvePromise?.(undefined);
        this.panel = null;
      });
    });
  }

  /**
   * Generate enhanced HTML with animations and theme support
   */
  private getHtmlContent(): string {
    const authorDateStr = this.commit.authorDate.toISOString().slice(0, 16);
    const commitDateStr = this.commit.commitDate.toISOString().slice(0, 16);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edit Commit Timestamp</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Flatpickr CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/dark.css">
  
  <!-- Flatpickr JS -->
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
  
  <style>
    /* Dark theme by default */
    :root {
      --bg-primary: #1e1e1e;
      --bg-secondary: #252526;
      --bg-tertiary: #2d2d30;
      --text-primary: #cccccc;
      --text-secondary: #969696;
      --border-color: #3c3c3c;
      --accent-color: #007acc;
      --success-color: #4ec9b0;
      --warning-color: #f9a825;
    }

    /* Light theme */
    @media (prefers-color-scheme: light) {
      :root {
        --bg-primary: #ffffff;
        --bg-secondary: #f3f3f3;
        --bg-tertiary: #e8e8e8;
        --text-primary: #333333;
        --text-secondary: #666666;
        --border-color: #d4d4d4;
        --accent-color: #007acc;
        --success-color: #16a085;
        --warning-color: #f39c12;
      }
    }

    body {
      background: var(--bg-primary);
      color: var(--text-primary);
      transition: background 0.3s ease, color 0.3s ease;
    }

    /* Fade-in animation */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    .fade-in-delay-1 {
      animation: fadeIn 0.5s ease-out 0.1s both;
    }

    .fade-in-delay-2 {
      animation: fadeIn 0.5s ease-out 0.2s both;
    }

    .fade-in-delay-3 {
      animation: fadeIn 0.5s ease-out 0.3s both;
    }

    /* Pulse animation for icons */
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.05);
      }
    }

    .pulse-icon {
      animation: pulse 2s ease-in-out infinite;
    }

    /* Button hover effects */
    .btn-primary {
      background: var(--accent-color);
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 122, 204, 0.4);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    /* Card styles */
    .card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      transition: all 0.3s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    /* Flatpickr theme adjustments */
    .flatpickr-calendar {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .flatpickr-day {
      color: var(--text-primary);
    }

    .flatpickr-day:hover {
      background: var(--bg-tertiary);
    }

    .flatpickr-day.selected {
      background: var(--accent-color);
      border-color: var(--accent-color);
    }

    .flatpickr-time input {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    /* Icon styles */
    .icon {
      width: 24px;
      height: 24px;
      display: inline-block;
      vertical-align: middle;
    }
  </style>
</head>
<body class="p-8 min-h-screen">
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="fade-in mb-8">
      <div class="flex items-center mb-4">
        <!-- Clock icon -->
        <svg class="icon mr-3 pulse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1 class="text-3xl font-bold">Edit Commit Timestamp</h1>
      </div>
      <p class="text-secondary">
        Editing commit: <code class="bg-tertiary px-2 py-1 rounded font-mono">${this.commit.shortHash}</code>
      </p>
      <p class="text-secondary mt-1">${this.escapeHtml(this.commit.subject)}</p>
    </div>

    <!-- Current Info Card -->
    <div class="card rounded-lg p-6 mb-6 fade-in-delay-1">
      <div class="flex items-center mb-4">
        <!-- Info icon -->
        <svg class="icon mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 class="text-xl font-semibold">Current Information</h2>
      </div>
      <div class="space-y-3">
        <div class="flex justify-between items-center py-2 border-b border-opacity-20" style="border-color: var(--border-color)">
          <span class="text-secondary">Author:</span>
          <span class="font-medium">${this.escapeHtml(this.commit.author)}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-opacity-20" style="border-color: var(--border-color)">
          <span class="text-secondary">Email:</span>
          <span class="font-medium">${this.escapeHtml(this.commit.email)}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-opacity-20" style="border-color: var(--border-color)">
          <span class="text-secondary">Current Author Date:</span>
          <span class="font-medium">${this.commit.authorDate.toLocaleString()}</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-secondary">Current Commit Date:</span>
          <span class="font-medium">${this.commit.commitDate.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Date/Time Pickers -->
    <div class="card rounded-lg p-6 mb-6 fade-in-delay-2">
      <div class="flex items-center mb-4">
        <!-- Calendar icon -->
        <svg class="icon mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <h2 class="text-xl font-semibold">New Timestamps</h2>
      </div>
      
      <!-- Author Date -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">
          Author Date & Time
          <span class="text-xs text-secondary ml-2">(when the commit was originally authored)</span>
        </label>
        <div class="relative">
          <input
            type="text"
            id="authorDate"
            class="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
            style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary)"
            placeholder="Select date and time"
          />
          <!-- Calendar icon in input -->
          <svg class="icon absolute right-3 top-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      </div>

      <!-- Commit Date -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">
          Commit Date & Time
          <span class="text-xs text-secondary ml-2">(when the commit was recorded)</span>
        </label>
        <div class="relative">
          <input
            type="text"
            id="commitDate"
            class="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
            style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary)"
            placeholder="Select date and time"
          />
          <svg class="icon absolute right-3 top-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <button
          id="syncBtn"
          class="mt-2 text-sm text-blue-500 hover:text-blue-400 transition-colors flex items-center"
        >
          <!-- Sync icon -->
          <svg class="icon mr-1" style="width: 16px; height: 16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Sync to Author Date
        </button>
      </div>

      <!-- Helper Text -->
      <div class="mt-4 p-4 rounded-lg" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3)">
        <p class="text-sm flex items-start">
          <!-- Light bulb icon -->
          <svg class="icon mr-2 flex-shrink-0 text-blue-400" style="width: 20px; height: 20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <strong>Tip:</strong>&nbsp;In most cases, author date and commit date are the same. 
          The commit date is updated when you amend or rebase a commit.
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-4 fade-in-delay-3">
      <button
        id="confirmBtn"
        class="btn-primary flex-1 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
      >
        <!-- Check icon -->
        <svg class="icon" style="width: 20px; height: 20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Confirm Changes
      </button>
      <button
        id="cancelBtn"
        class="btn-secondary flex-1 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
        style="color: var(--text-primary)"
      >
        <!-- X icon -->
        <svg class="icon" style="width: 20px; height: 20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Cancel
      </button>
    </div>

    <!-- Warning -->
    <div class="mt-6 p-4 rounded-lg fade-in-delay-3" style="background: rgba(249, 168, 37, 0.1); border: 1px solid rgba(249, 168, 37, 0.3)">
      <p class="text-sm flex items-start">
        <!-- Warning icon -->
        <svg class="icon mr-2 flex-shrink-0 text-yellow-500" style="width: 20px; height: 20px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span><strong>Warning:</strong> Changing timestamps will rewrite git history. 
        Make sure this commit hasn't been pushed to a shared repository.</span>
      </p>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // Initialize flatpickr with theme support
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const authorPicker = flatpickr("#authorDate", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      defaultDate: "${authorDateStr}",
      time_24hr: true,
      allowInput: true,
      theme: isDark ? "dark" : "light",
    });

    const commitPicker = flatpickr("#commitDate", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      defaultDate: "${commitDateStr}",
      time_24hr: true,
      allowInput: true,
      theme: isDark ? "dark" : "light",
    });

    // Sync button
    document.getElementById('syncBtn').addEventListener('click', () => {
      const authorDate = authorPicker.selectedDates[0];
      if (authorDate) {
        commitPicker.setDate(authorDate);
      }
    });

    // Confirm button with animation
    document.getElementById('confirmBtn').addEventListener('click', () => {
      const authorDate = authorPicker.selectedDates[0];
      const commitDate = commitPicker.selectedDates[0];

      if (!authorDate || !commitDate) {
        alert('Please select both dates');
        return;
      }

      // Add loading state
      const btn = document.getElementById('confirmBtn');
      btn.innerHTML = '<svg class="animate-spin icon mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Applying...';
      btn.disabled = true;

      vscode.postMessage({
        command: 'confirm',
        authorDate: authorDate.toISOString(),
        commitDate: commitDate.toISOString(),
      });
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
      vscode.postMessage({
        command: 'cancel',
      });
    });

    // Theme change listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Reload flatpickr with new theme
      authorPicker.destroy();
      commitPicker.destroy();
      location.reload();
    });
  </script>
</body>
</html>`;
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
