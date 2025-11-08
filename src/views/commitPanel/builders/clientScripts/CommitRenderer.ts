/**
 * Client-side commit list renderer (generates JavaScript string)
 * Handles rendering of commit list
 */

export class CommitRendererScript {
  public static generate(): string {
    return `
      /**
       * CommitRenderer - Renders commit list
       */
      class CommitRenderer {
        constructor(stateManager) {
          this.state = stateManager;
        }

        renderCommits(commits) {
          const list = document.getElementById('commitList');
          const empty = document.getElementById('emptyState');
          const selectAllContainer = document.getElementById('selectAllContainer');
          const bulkBtn = document.getElementById('bulkBtn');

          if (commits.length === 0) {
            this.showEmptyState(list, empty, selectAllContainer, bulkBtn);
            return;
          }

          this.showCommitList(list, empty, selectAllContainer);
          this.updateSelectionUI();
          this.renderCommitList(list, commits);
          this.attachEventListeners(commits);
        }

        showEmptyState(list, empty, selectAllContainer, bulkBtn) {
          list.classList.add('hidden');
          empty.classList.remove('hidden');
          selectAllContainer.classList.add('hidden');
          bulkBtn.classList.add('hidden');
        }

        showCommitList(list, empty, selectAllContainer) {
          list.classList.remove('hidden');
          empty.classList.add('hidden');
          selectAllContainer.classList.remove('hidden');
        }

        updateSelectionUI() {
          const selectedCount = this.state.getSelectedCount();
          document.getElementById('selectedCount').textContent = 
            selectedCount > 0 ? \`\${selectedCount} selected\` : '0 selected';

          this.updateSelectAllCheckbox();
          this.updateBulkButton();
        }

        updateSelectAllCheckbox() {
          const selectAllCheckbox = document.getElementById('selectAllCheckbox');
          this.state.setUpdateFlag(true);

          if (this.state.areAllSelected()) {
            selectAllCheckbox.setAttribute('checked', '');
            selectAllCheckbox.checked = true;
          } else {
            selectAllCheckbox.removeAttribute('checked');
            selectAllCheckbox.checked = false;
          }

          setTimeout(() => {
            this.state.setUpdateFlag(false);
          }, 0);
        }

        updateBulkButton() {
          const bulkBtn = document.getElementById('bulkBtn');
          if (this.state.getSelectedCount() > 0) {
            bulkBtn.classList.remove('hidden');
          } else {
            bulkBtn.classList.add('hidden');
          }
        }

        renderCommitList(list, commits) {
          const header = this.createTableHeader();
          const rows = commits.map((c, index) => this.createCommitRow(c, index, commits.length)).join('');
          list.innerHTML = header + rows;
        }

        createTableHeader() {
          return \`
            <div class="commits-table-header">
              <div class="header-cell"></div>
              <div class="header-cell">
                <i class="codicon codicon-symbol-namespace"></i>
                Branch
              </div>
              <div class="header-cell"></div>
              <div class="header-cell">
                <i class="codicon codicon-comment-discussion"></i>
                Commit Message
              </div>
              <div class="header-cell">
                <i class="codicon codicon-account"></i>
                Author
              </div>
              <div class="header-cell">
                <i class="codicon codicon-history"></i>
                Changes
              </div>
              <div class="header-cell"></div>
            </div>
          \`;
        }

        createCommitRow(commit, index, totalCommits) {
          const isSelected = this.state.isCommitSelected(commit.hash);
          return \`
            <div class="commit-row \${isSelected ? 'selected' : ''}" data-hash="\${commit.hash}">
              <div class="commit-checkbox-cell">
                <vscode-checkbox 
                  class="commit-checkbox" 
                  data-hash="\${commit.hash}"
                  \${isSelected ? 'checked' : ''}
                ></vscode-checkbox>
              </div>
              <div class="commit-hash">\${commit.shortHash}</div>
              <div class="commit-graph-cell">
                <div class="commit-dot"></div>
                \${index < totalCommits - 1 ? '<div class="commit-line"></div>' : ''}
              </div>
              <div class="commit-message" title="\${this.escapeHtml(commit.message)}">\${this.escapeHtml(commit.message)}</div>
              <div class="commit-author" title="\${this.escapeHtml(commit.author)}">\${this.escapeHtml(commit.author)}</div>
              <div class="commit-date">\${commit.relativeDate}</div>
              <div class="commit-actions">
                <vscode-button appearance="icon" onclick="editCommit('\${commit.hash}')" title="Edit commit">
                  <span class="codicon codicon-edit"></span>
                </vscode-button>
              </div>
            </div>
          \`;
        }

        attachEventListeners(commits) {
          this.updateCheckboxStates();
          this.attachCheckboxListeners(commits);
          this.attachRowClickListeners();
        }

        updateCheckboxStates() {
          document.querySelectorAll('.commit-checkbox').forEach(cb => {
            const hash = cb.getAttribute('data-hash');
            cb.checked = this.state.isCommitSelected(hash);
          });
        }

        attachCheckboxListeners(commits) {
          document.querySelectorAll('.commit-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
              e.stopPropagation();
              const hash = cb.getAttribute('data-hash');
              this.state.toggleCommitSelection(hash);
              this.renderCommits(commits);
            });

            cb.addEventListener('click', (e) => {
              e.stopPropagation();
            });
          });
        }

        attachRowClickListeners() {
          document.querySelectorAll('.commit-row').forEach(row => {
            row.addEventListener('click', (e) => {
              if (this.shouldIgnoreClick(e)) {
                return;
              }

              const hash = row.getAttribute('data-hash');
              vscode.postMessage({ type: 'editCommit', hash });
            });
          });
        }

        shouldIgnoreClick(e) {
          return e.target.classList.contains('commit-checkbox-cell') ||
                 e.target.closest('.commit-checkbox-cell') ||
                 e.target.classList.contains('commit-actions') ||
                 e.target.closest('.commit-actions') ||
                 e.target.tagName === 'VSCODE-CHECKBOX' ||
                 e.target.tagName === 'VSCODE-BUTTON' ||
                 e.target.closest('vscode-button') ||
                 e.target.closest('vscode-checkbox');
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

