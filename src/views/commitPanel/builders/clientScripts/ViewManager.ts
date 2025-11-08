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
          this.initializeDatePickers(commit);
        }

        populateEditForm(commit) {
          document.getElementById('editHash').value = commit.shortHash;
          document.getElementById('editHashFull').value = commit.hash;
          document.getElementById('editMessage').value = commit.message;
        }

        initializeDatePickers(commit) {
          this.state.destroyDatePickers();

          const authorPicker = flatpickr('#editAuthorDate', {
            enableTime: true,
            dateFormat: 'Y-m-d H:i',
            defaultDate: commit.authorDate,
            time_24hr: true,
            position: 'auto',
            static: false,
            appendTo: document.body
          });

          const commitPicker = flatpickr('#editCommitDate', {
            enableTime: true,
            dateFormat: 'Y-m-d H:i',
            defaultDate: commit.commitDate,
            time_24hr: true,
            position: 'auto',
            static: false,
            appendTo: document.body
          });

          this.state.setDatePickers(authorPicker, commitPicker);
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
          this.initializeBulkDatePickers();
        }

        createBulkEditItem(commit, index) {
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
              <div class="bulk-edit-item-dates">
                <div class="form-group">
                  <label class="form-label">
                    <i class="codicon codicon-calendar"></i>
                    Author Date
                  </label>
                  <vscode-text-field class="bulk-author-date" 
                         value="\${new Date(commit.authorDate).toISOString().slice(0, 16).replace('T', ' ')}">
                  </vscode-text-field>
                </div>
                <div class="form-group">
                  <label class="form-label">
                    <i class="codicon codicon-clock"></i>
                    Commit Date
                  </label>
                  <vscode-text-field class="bulk-commit-date" 
                         value="\${new Date(commit.commitDate).toISOString().slice(0, 16).replace('T', ' ')}">
                  </vscode-text-field>
                </div>
              </div>
            </div>
          \`;
        }

        initializeBulkDatePickers() {
          document.querySelectorAll('.bulk-author-date, .bulk-commit-date').forEach(input => {
            flatpickr(input, {
              enableTime: true,
              dateFormat: 'Y-m-d H:i',
              time_24hr: true,
              position: 'auto',
              static: false,
              appendTo: document.body
            });
          });
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

