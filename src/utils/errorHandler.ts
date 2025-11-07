import * as vscode from 'vscode';
import { Messages } from './messages';

/**
 * Centralized error handling with better user messages
 */
export class ErrorHandler {
  /**
   * Handle git command errors
   */
  static handleGitError(error: any, context?: string): void {
    const message = error?.message || String(error);
    
    // Parse common git errors and provide helpful messages
    if (message.includes('not a git repository')) {
      vscode.window.showErrorMessage(
        Messages.WARNING.NO_GIT_REPO,
        'Open Folder'
      ).then(choice => {
        if (choice === 'Open Folder') {
          vscode.commands.executeCommand('vscode.openFolder');
        }
      });
      return;
    }

    if (message.includes('HEAD detached')) {
      vscode.window.showWarningMessage(Messages.WARNING.DETACHED_HEAD);
      return;
    }

    if (message.includes('working tree')) {
      vscode.window.showErrorMessage(Messages.ERROR.WORKING_TREE_DIRTY);
      return;
    }

    // Generic error with context
    if (context) {
      vscode.window.showErrorMessage(`${context}: ${message}`);
    } else {
      vscode.window.showErrorMessage(message);
    }
  }

  /**
   * Handle general errors
   */
  static handleError(error: any, context?: string): void {
    const message = error?.message || String(error);
    
    if (context) {
      vscode.window.showErrorMessage(`${context}: ${message}`);
    } else {
      vscode.window.showErrorMessage(message);
    }

    // Log to console for debugging
    console.error(`[Git Time Machine] ${context || 'Error'}:`, error);
  }

  /**
   * Show validation error
   */
  static showValidationError(message: string): void {
    vscode.window.showErrorMessage(message);
  }

  /**
   * Handle async operation with error handling
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, context);
      return undefined;
    }
  }
}

/**
 * Validation utilities
 */
export class Validator {
  /**
   * Validate commit message
   */
  static validateCommitMessage(message: string): string | null {
    if (!message || message.trim().length === 0) {
      return Messages.ERROR.EMPTY_MESSAGE;
    }
    
    // Optional: Add more validation rules
    if (message.length > 5000) {
      return 'Commit message is too long (max 5000 characters)';
    }
    
    return null;
  }

  /**
   * Validate date input
   */
  static validateDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // Check if date is reasonable (not too far in past or future)
      const now = new Date();
      const tenYearsAgo = new Date(now.getFullYear() - 10, 0, 1);
      const oneYearFuture = new Date(now.getFullYear() + 1, 11, 31);
      
      if (date < tenYearsAgo || date > oneYearFuture) {
        return null;
      }
      
      return date;
    } catch {
      return null;
    }
  }

  /**
   * Validate workspace
   */
  static validateWorkspace(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }
    return workspaceFolders[0].uri.fsPath;
  }
}

