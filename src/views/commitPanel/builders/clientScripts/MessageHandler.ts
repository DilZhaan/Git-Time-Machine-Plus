/**
 * Client-side message handler (generates JavaScript string)
 * Handles messages from extension
 */

export class MessageHandlerScript {
  public static generate(): string {
    return `
      /**
       * MessageHandler - Handles messages from extension
       */
      class MessageHandler {
        constructor(stateManager, commitRenderer, viewManager) {
          this.state = stateManager;
          this.renderer = commitRenderer;
          this.viewManager = viewManager;
        }

        initializeMessageListener() {
          window.addEventListener('message', event => {
            this.handleMessage(event.data);
          });
        }

        handleMessage(message) {
          switch (message.type) {
            case 'commitsLoaded':
              this.handleCommitsLoaded(message);
              break;
            case 'commitsFiltered':
              this.handleCommitsFiltered(message);
              break;
            case 'editMode':
              this.handleEditMode(message);
              break;
            case 'editComplete':
              this.handleEditComplete();
              break;
            case 'editCancelled':
              this.handleEditCancelled();
              break;
            case 'bulkEditMode':
              this.handleBulkEditMode(message);
              break;
            case 'applyingEdits':
              this.handleApplyingEdits(message);
              break;
            case 'editProgress':
              this.handleEditProgress(message);
              break;
            case 'bulkEditComplete':
              this.handleBulkEditComplete();
              break;
            case 'error':
              this.handleError(message);
              break;
            default:
              console.warn('Unknown message type:', message.type);
          }
        }

        handleCommitsLoaded(message) {
          this.state.setCommits(message.commits);
          this.state.deselectAllCommits();
          this.renderer.renderCommits(message.commits);
        }

        handleCommitsFiltered(message) {
          this.renderer.renderCommits(message.commits);
        }

        handleEditMode(message) {
          this.viewManager.showEditMode(message.commit);
        }

        handleEditComplete() {
          this.viewManager.showListView();
        }

        handleEditCancelled() {
          this.viewManager.showListView();
        }

        handleBulkEditMode(message) {
          this.viewManager.showBulkEditMode(message.commits);
        }

        handleApplyingEdits(message) {
          document.getElementById('bulkProgress').classList.remove('hidden');
          document.getElementById('applyAllBtn').disabled = true;
        }

        handleEditProgress(message) {
          const percent = (message.current / message.total) * 100;
          const progressText = document.getElementById('progressText');
          if (progressText) {
            progressText.textContent = \`Processing \${message.current} of \${message.total}...\`;
          }
        }

        handleBulkEditComplete() {
          this.viewManager.showListView();
        }

        handleError(message) {
          console.error('Error:', message.message);
        }
      }
    `;
  }
}

