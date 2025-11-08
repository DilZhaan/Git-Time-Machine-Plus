/**
 * Client-side view manager (generates JavaScript string)
 * Manages view transitions and editing
 */

export class ViewManagerScript {
  public static generate(): string {
    return `
      /**
       * ViewManager - Manages view transitions and editing
       */
      class ViewManager {
        constructor(stateManager) {
          this.state = stateManager;
        }

        showListView() {
          this.state.setMode('list');
          document.getElementById('listView').classList.remove('hidden');
          document.getElementById('editView').classList.add('hidden');
          document.getElementById('bulkEditView').classList.add('hidden');
          vscode.postMessage({ type: 'refresh' });
        }

        showEditMode(commit) {
          this.state.setMode('edit');
          document.getElementById('listView').classList.add('hidden');
          document.getElementById('bulkEditView').classList.add('hidden');
          document.getElementById('editView').classList.remove('hidden');

          this.populateEditForm(commit);
        }

        populateEditForm(commit) {
          document.getElementById('editHash').value = commit.shortHash;
          document.getElementById('editHashFull').value = commit.hash;
          document.getElementById('editMessage').value = commit.message;
          
          // Set the datetime-local input value
          const dateInput = document.getElementById('editDate');
          if (dateInput) {
            // Convert ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
            const date = new Date(commit.authorDate);
            const localDateTime = this.formatDateTimeLocal(date);
            dateInput.value = localDateTime;
          }
        }

        formatDateTimeLocal(date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return \`\${year}-\${month}-\${day}T\${hours}:\${minutes}\`;
        }

        showBulkEditMode(commits) {
          this.state.setMode('bulk');
          document.getElementById('listView').classList.add('hidden');
          document.getElementById('editView').classList.add('hidden');
          document.getElementById('bulkEditView').classList.remove('hidden');
          document.getElementById('bulkProgress').classList.add('hidden');

          this.renderBulkEditList(commits);
        }

        renderBulkEditList(commits) {
          const list = document.getElementById('bulkEditList');
          list.innerHTML = commits.map((c, index) => this.createBulkEditItem(c, index)).join('');
        }

        createBulkEditItem(commit, index) {
          const date = new Date(commit.authorDate);
          const localDateTime = this.formatDateTimeLocal(date);
          
          return \`
            <div class="bulk-edit-item" data-hash="\${commit.hash}">
              <div class="bulk-edit-item-header">
                <i class="codicon codicon-git-commit"></i>
                \${index + 1}. \${commit.shortHash} - \${this.escapeHtml(commit.message)}
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="codicon codicon-comment"></i>
                  Message
                </label>
                <vscode-text-area class="bulk-message bulk-edit-message-field" rows="3" resize="vertical">\${this.escapeHtml(commit.message)}</vscode-text-area>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <i class="codicon codicon-calendar"></i>
                  Date & Time
                </label>
                <input type="datetime-local" class="bulk-date date-input" value="\${localDateTime}" />
              </div>
            </div>
          \`;
        }

        escapeHtml(text) {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }
      }
    `;
  }
}

