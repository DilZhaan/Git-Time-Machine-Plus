/**
 * Builder for HTML templates
 * Follows Single Responsibility Principle - only handles HTML structure
 */

export class HtmlTemplateBuilder {
  /**
   * Build complete body HTML
   */
  public buildBody(): string {
    return `
      ${this.buildHeader()}
      ${this.buildMainContent()}
    `;
  }

  /**
   * Build header section with search and actions
   */
  private buildHeader(): string {
    return `
      <div class="header">
        <div class="search-wrapper">
          <vscode-text-field 
            id="searchInput" 
            placeholder="Search commits by message, author, or hash...">
            <span slot="start" class="codicon codicon-search"></span>
          </vscode-text-field>
        </div>
        <vscode-button id="refreshBtn" appearance="icon" title="Refresh commits">
          <span class="codicon codicon-refresh"></span>
        </vscode-button>
        <vscode-button id="bulkBtn" appearance="secondary" class="hidden">
          <span slot="start" class="codicon codicon-edit"></span>
          Bulk Edit
        </vscode-button>
      </div>
    `;
  }

  /**
   * Build main content area with all views
   */
  private buildMainContent(): string {
    return `
      <div id="mainContent">
        ${this.buildListView()}
        ${this.buildSingleEditView()}
        ${this.buildBulkEditView()}
        ${this.buildEmptyState()}
      </div>
    `;
  }

  /**
   * Build list view for displaying commits
   */
  private buildListView(): string {
    return `
      <div id="listView">
        <div id="selectAllContainer" class="hidden bulk-header">
          <label>
            <vscode-checkbox id="selectAllCheckbox"></vscode-checkbox>
            <span id="selectedCount">0 selected</span>
          </label>
        </div>
        <div id="commitList" class="commits-container"></div>
      </div>
    `;
  }

  /**
   * Build single commit edit view
   */
  private buildSingleEditView(): string {
    return `
      <div id="editView" class="hidden">
        <div class="edit-panel">
          <h3>
            <i class="codicon codicon-edit"></i>
            Edit Commit
          </h3>
          ${this.buildEditForm()}
          ${this.buildEditActions()}
        </div>
      </div>
    `;
  }

  /**
   * Build edit form fields
   */
  private buildEditForm(): string {
    return `
      <div class="form-group">
        <label class="form-label">
          <i class="codicon codicon-git-commit"></i>
          Hash
        </label>
        <vscode-text-field id="editHash" readonly></vscode-text-field>
        <input type="hidden" id="editHashFull" />
      </div>
      <div class="form-group">
        <label class="form-label">
          <i class="codicon codicon-comment"></i>
          Commit Message
        </label>
        <vscode-text-area id="editMessage" rows="4" resize="vertical"></vscode-text-area>
      </div>
      <div class="form-group">
        <label class="form-label">
          <i class="codicon codicon-calendar"></i>
          Date & Time
        </label>
        <input type="datetime-local" id="editDate" class="date-input" />
      </div>
    `;
  }

  /**
   * Build edit action buttons
   */
  private buildEditActions(): string {
    return `
      <div class="form-actions">
        <vscode-button id="saveEditBtn">
          <span slot="start" class="codicon codicon-save"></span>
          Save Changes
        </vscode-button>
        <vscode-button id="cancelEditBtn" appearance="secondary">
          <span slot="start" class="codicon codicon-close"></span>
          Cancel
        </vscode-button>
      </div>
    `;
  }

  /**
   * Build bulk edit view
   */
  private buildBulkEditView(): string {
    return `
      <div id="bulkEditView" class="hidden">
        <div class="edit-panel">
          <h3>
            <i class="codicon codicon-list-selection"></i>
            Bulk Edit Mode
          </h3>
          <div id="bulkEditList" class="bulk-edit-list"></div>
          ${this.buildBulkProgress()}
          ${this.buildBulkActions()}
        </div>
      </div>
    `;
  }

  /**
   * Build bulk edit progress indicator
   */
  private buildBulkProgress(): string {
    return `
      <div id="bulkProgress" class="hidden">
        <vscode-progress-ring></vscode-progress-ring>
        <p style="text-align: center; margin-top: 8px; font-size: 13px;" id="progressText">
          Processing...
        </p>
      </div>
    `;
  }

  /**
   * Build bulk edit action buttons
   */
  private buildBulkActions(): string {
    return `
      <div class="form-actions">
        <vscode-button id="applyAllBtn">
          <span slot="start" class="codicon codicon-check-all"></span>
          Apply All Changes
        </vscode-button>
        <vscode-button id="cancelBulkBtn" appearance="secondary">
          <span slot="start" class="codicon codicon-close"></span>
          Cancel
        </vscode-button>
      </div>
    `;
  }

  /**
   * Build empty state view
   */
  private buildEmptyState(): string {
    return `
      <div id="emptyState" class="empty-state hidden">
        <div class="empty-icon">
          <i class="codicon codicon-check" style="font-size: 64px;"></i>
        </div>
        <div class="empty-state-title">No unpushed commits</div>
        <div class="empty-state-desc">All commits are pushed to remote</div>
      </div>
    `;
  }
}

