/**
 * Builder for CSS styles
 * Follows Single Responsibility Principle - only handles styles
 */

export class StyleBuilder {
  /**
   * Build complete stylesheet
   */
  public buildStyles(): string {
    return `
      <style>
        ${this.getBaseStyles()}
        ${this.getHeaderStyles()}
        ${this.getMainContentStyles()}
        ${this.getCommitTableStyles()}
        ${this.getCommitRowStyles()}
        ${this.getBulkHeaderStyles()}
        ${this.getEditPanelStyles()}
        ${this.getBulkEditStyles()}
        ${this.getProgressBarStyles()}
        ${this.getEmptyStateStyles()}
        ${this.getUtilityStyles()}
        ${this.getScrollbarStyles()}
      </style>
    `;
  }

  private getBaseStyles(): string {
    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size);
        font-weight: var(--vscode-font-weight);
        background-color: var(--vscode-panel-background);
        color: var(--vscode-foreground);
        padding: 0;
        line-height: 1.5;
        overflow: hidden;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
    `;
  }

  private getHeaderStyles(): string {
    return `
      /* Header Section */
      .header {
        display: flex;
        gap: 8px;
        padding: 8px 12px;
        background-color: var(--vscode-panel-background);
        border-bottom: 1px solid var(--vscode-panel-border);
        z-index: 100;
        flex-shrink: 0;
        align-items: center;
      }
      .search-wrapper {
        position: relative;
        flex: 1;
      }
      vscode-text-field {
        width: 100%;
      }
      vscode-text-field::part(root) {
        height: 26px;
      }
      vscode-button {
        height: 26px;
      }
    `;
  }

  private getMainContentStyles(): string {
    return `
      /* Main Content */
      #mainContent {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }
      #listView, #editView, #bulkEditView {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }
      .commits-container {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }
    `;
  }

  private getCommitTableStyles(): string {
    return `
      /* Table Header */
      .commits-table-header {
        display: grid;
        grid-template-columns: 40px 50px 30px minmax(200px, 1fr) 140px 100px 60px;
        gap: 8px;
        padding: 6px 12px;
        background-color: var(--vscode-sideBar-background);
        border-bottom: 1px solid var(--vscode-panel-border);
        font-size: 11px;
        font-weight: 600;
        color: var(--vscode-descriptionForeground);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .header-cell {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    `;
  }

  private getCommitRowStyles(): string {
    return `
      /* Commit Rows */
      .commit-row {
        display: grid;
        grid-template-columns: 40px 50px 30px minmax(200px, 1fr) 140px 100px 60px;
        gap: 8px;
        padding: 4px 12px;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.05s;
        border-bottom: 1px solid transparent;
        font-size: 12px;
        min-height: 28px;
      }
      .commit-row:hover {
        background-color: var(--vscode-list-hoverBackground);
      }
      .commit-row.selected {
        background-color: var(--vscode-list-activeSelectionBackground);
        color: var(--vscode-list-activeSelectionForeground);
      }
      
      /* Commit Row Cells */
      .commit-checkbox-cell {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .commit-graph-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 100%;
      }
      .commit-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--vscode-charts-orange);
        border: 2px solid var(--vscode-panel-background);
        z-index: 2;
        position: relative;
      }
      .commit-line {
        width: 2px;
        background-color: var(--vscode-charts-orange);
        position: absolute;
        top: 50%;
        bottom: -100%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1;
        opacity: 0.6;
      }
      .commit-hash {
        font-family: var(--vscode-editor-font-family, 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace);
        font-size: 11px;
        color: var(--vscode-terminal-ansiYellow);
        font-weight: 500;
      }
      .commit-message {
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .commit-author {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .commit-date {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
      }
      .commit-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.1s;
      }
      .commit-row:hover .commit-actions {
        opacity: 1;
      }
    `;
  }

  private getBulkHeaderStyles(): string {
    return `
      /* Bulk Selection Header */
      .bulk-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 12px;
        background-color: var(--vscode-list-inactiveSelectionBackground);
        border-bottom: 1px solid var(--vscode-panel-border);
        position: sticky;
        top: 0;
        z-index: 99;
      }
      .bulk-header label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 500;
      }
    `;
  }

  private getEditPanelStyles(): string {
    return `
      /* Edit Panel - Responsive */
      .edit-panel {
        background-color: var(--vscode-panel-background);
        padding: 16px;
        margin: 0;
        animation: slideIn 0.2s ease-out;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        gap: 12px;
        min-height: 0;
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .edit-panel h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--vscode-foreground);
      }
      .form-group {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .form-group vscode-text-area,
      .form-group vscode-text-field {
        width: 100%;
        min-width: 0;
      }
      .form-group vscode-text-area {
        resize: vertical;
        min-height: 80px;
      }
      .date-input {
        cursor: pointer !important;
      }
      .date-input::part(control) {
        cursor: pointer !important;
      }
      .date-input input {
        cursor: pointer !important;
      }
      .form-label {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
        font-size: 12px;
        font-weight: 500;
        color: var(--vscode-foreground);
      }
      .form-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--vscode-panel-border);
        flex-wrap: wrap;
      }
    `;
  }

  private getBulkEditStyles(): string {
    return `
      /* Bulk Edit - Responsive Layout */
      .bulk-edit-list {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      .bulk-edit-item {
        border: 1px solid var(--vscode-panel-border);
        border-radius: 4px;
        padding: 16px;
        background-color: var(--vscode-sideBar-background);
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      .bulk-edit-item-header {
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--vscode-foreground);
      }
      .bulk-edit-item-fields {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      .bulk-edit-item-dates {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        min-width: 0;
      }
      @media (max-width: 600px) {
        .bulk-edit-item-dates {
          grid-template-columns: 1fr;
        }
      }
      .bulk-edit-message-field {
        width: 100%;
        min-width: 0;
      }
    `;
  }

  private getProgressBarStyles(): string {
    return `
      /* Progress Bar */
      .progress-bar {
        width: 100%;
        height: 6px;
        background-color: var(--vscode-editorWidget-background);
        border-radius: 3px;
        margin: 12px 0;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: var(--vscode-progressBar-background);
        transition: width 0.3s ease-out;
        border-radius: 3px;
      }
    `;
  }

  private getEmptyStateStyles(): string {
    return `
      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--vscode-descriptionForeground);
      }
      .empty-icon {
        font-size: 64px;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      .empty-state-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--vscode-foreground);
      }
      .empty-state-desc {
        font-size: 13px;
        opacity: 0.7;
      }
    `;
  }

  private getUtilityStyles(): string {
    return `
      /* Utility Classes */
      .hidden { 
        display: none !important; 
      }
    `;
  }

  private getScrollbarStyles(): string {
    return `
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      ::-webkit-scrollbar-track {
        background: var(--vscode-scrollbarSlider-background);
      }
      ::-webkit-scrollbar-thumb {
        background: var(--vscode-scrollbarSlider-hoverBackground);
        border-radius: 5px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--vscode-scrollbarSlider-activeBackground);
      }
    `;
  }
}

