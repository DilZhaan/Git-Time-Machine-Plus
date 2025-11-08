/**
 * Client-side event handler (generates JavaScript string)
 * Handles DOM events
 */

export class EventHandlerScript {
  public static generate(): string {
    return `
      /**
       * EventHandler - Handles DOM events
       */
      class EventHandler {
        constructor(stateManager, commitRenderer, viewManager) {
          this.state = stateManager;
          this.renderer = commitRenderer;
          this.viewManager = viewManager;
        }

        async initializeEventListeners() {
          await this.waitForWebComponents();
          this.attachSearchListener();
          this.attachRefreshListener();
          this.attachBulkButtonListener();
          this.attachSelectAllListener();
          this.attachEditActionListeners();
          this.attachBulkActionListeners();
          this.requestInitialLoad();
        }

        async waitForWebComponents() {
          try {
            const timeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout waiting for web components')), 5000)
            );

            const componentsReady = Promise.all([
              customElements.whenDefined('vscode-text-field'),
              customElements.whenDefined('vscode-button'),
              customElements.whenDefined('vscode-checkbox'),
              customElements.whenDefined('vscode-text-area')
            ]);

            await Promise.race([componentsReady, timeout]);
            console.log('✅ All web components are defined');
          } catch (e) {
            console.warn('⚠️ Web components may not be fully loaded:', e);
          }
        }

        attachSearchListener() {
          const searchInput = document.getElementById('searchInput');
          if (searchInput) {
            searchInput.addEventListener('input', (e) => {
              const query = e.target.value;
              vscode.postMessage({ type: 'search', query });
            });
            console.log('✅ Search input listener attached');
          }
        }

        attachRefreshListener() {
          const refreshBtn = document.getElementById('refreshBtn');
          if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
              vscode.postMessage({ type: 'refresh' });
            });
            console.log('✅ Refresh button listener attached');
          }
        }

        attachBulkButtonListener() {
          const bulkBtn = document.getElementById('bulkBtn');
          if (bulkBtn) {
            bulkBtn.addEventListener('click', () => {
              if (this.state.getSelectedCount() > 0) {
                vscode.postMessage({ 
                  type: 'bulkEditStart', 
                  hashes: this.state.getSelectedHashes()
                });
              }
            });
            console.log('✅ Bulk button listener attached');
          }
        }

        attachSelectAllListener() {
          const selectAllCheckbox = document.getElementById('selectAllCheckbox');
          if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
              if (this.state.isUpdating()) {
                return;
              }

              if (this.state.areAllSelected()) {
                this.state.deselectAllCommits();
              } else {
                this.state.selectAllCommits();
              }

              this.renderer.renderCommits(this.state.getCommits());
            });
          }
        }

        attachEditActionListeners() {
          const saveEditBtn = document.getElementById('saveEditBtn');
          if (saveEditBtn) {
            saveEditBtn.addEventListener('click', () => {
              const edit = {
                hash: document.getElementById('editHashFull').value,
                newMessage: document.getElementById('editMessage').value,
                newAuthorDate: document.getElementById('editAuthorDate').value,
                newCommitDate: document.getElementById('editCommitDate').value
              };
              vscode.postMessage({ type: 'saveEdit', edit });
            });
          }

          const cancelEditBtn = document.getElementById('cancelEditBtn');
          if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
              this.viewManager.showListView();
            });
          }
        }

        attachBulkActionListeners() {
          const applyAllBtn = document.getElementById('applyAllBtn');
          if (applyAllBtn) {
            applyAllBtn.addEventListener('click', () => {
              const edits = [];
              document.querySelectorAll('.bulk-edit-item').forEach(item => {
                edits.push({
                  hash: item.dataset.hash,
                  newMessage: item.querySelector('.bulk-message').value,
                  newAuthorDate: item.querySelector('.bulk-author-date').value,
                  newCommitDate: item.querySelector('.bulk-commit-date').value
                });
              });
              vscode.postMessage({ type: 'applyAllEdits', edits });
            });
          }

          const cancelBulkBtn = document.getElementById('cancelBulkBtn');
          if (cancelBulkBtn) {
            cancelBulkBtn.addEventListener('click', () => {
              this.viewManager.showListView();
            });
          }
        }

        requestInitialLoad() {
          console.log('Requesting initial commit load...');
          vscode.postMessage({ type: 'refresh' });
        }
      }
    `;
  }
}

