import * as vscode from 'vscode';

/**
 * Privacy-friendly telemetry (opt-in, anonymous)
 * Only tracks feature usage, no personal data
 */
export class Telemetry {
  private static enabled: boolean | null = null;
  private static readonly CONFIG_KEY = 'gitTimeMachine.telemetry.enabled';

  /**
   * Check if telemetry is enabled
   */
  static isEnabled(): boolean {
    if (this.enabled === null) {
      const config = vscode.workspace.getConfiguration();
      this.enabled = config.get<boolean>(this.CONFIG_KEY, false);
    }
    return this.enabled;
  }

  /**
   * Track a feature usage event
   */
  static trackFeatureUsage(feature: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled()) {
      return;
    }

    // In a real implementation, you would send this to your analytics service
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', feature, metadata);
    }

    // Example: Send to analytics service
    // this.sendEvent(feature, metadata);
  }

  /**
   * Track error (anonymous, no stack traces with PII)
   */
  static trackError(errorType: string, context?: string): void {
    if (!this.isEnabled()) {
      return;
    }

    const data = {
      errorType,
      context: context || 'unknown',
      timestamp: Date.now(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry] Error:', data);
    }
  }

  /**
   * Prompt user to enable telemetry (only once)
   */
  static async promptForTelemetry(): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const hasPrompted = config.get<boolean>('gitTimeMachine.telemetry.hasPrompted', false);

    if (hasPrompted) {
      return;
    }

    const choice = await vscode.window.showInformationMessage(
      'Help improve Git Time Machine by sending anonymous usage data? (No personal information is collected)',
      'Enable',
      'Disable',
      'Learn More'
    );

    if (choice === 'Learn More') {
      vscode.env.openExternal(vscode.Uri.parse('https://github.com/DilZhaan/Git-Time-Machine-Plus#privacy'));
      return;
    }

    if (choice === 'Enable') {
      await config.update(this.CONFIG_KEY, true, vscode.ConfigurationTarget.Global);
      this.enabled = true;
      vscode.window.showInformationMessage('Thank you! Telemetry enabled.');
    } else if (choice === 'Disable') {
      await config.update(this.CONFIG_KEY, false, vscode.ConfigurationTarget.Global);
      this.enabled = false;
    }

    // Mark as prompted
    await config.update('gitTimeMachine.telemetry.hasPrompted', true, vscode.ConfigurationTarget.Global);
  }

  /**
   * Feature usage events
   */
  static Events = {
    EXTENSION_ACTIVATED: 'extension.activated',
    SHOW_UNPUSHED_COMMITS: 'show.unpushedCommits',
    EDIT_SINGLE_COMMIT: 'edit.singleCommit',
    EDIT_BULK_COMMITS: 'edit.bulkCommits',
    EDIT_MESSAGE: 'edit.message',
    EDIT_TIMESTAMP: 'edit.timestamp',
    UNDO_CHANGES: 'undo.changes',
    WEBVIEW_OPENED: 'webview.opened',
    BACKUP_CREATED: 'backup.created',
    ERROR_OCCURRED: 'error.occurred',
  };
}

