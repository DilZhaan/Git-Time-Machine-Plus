/**
 * Client-side state manager (generates JavaScript string)
 * Manages webview state
 */

export class StateManagerScript {
  public static generate(): string {
    return `
      /**
       * StateManager - Manages application state
       */
      class StateManager {
        constructor() {
          this.allCommits = [];
          this.selectedHashes = new Set();
          this.currentMode = 'list'; // 'list', 'edit', 'bulk'
          this.isUpdatingSelectAll = false;
          this.authorDatePicker = null;
          this.commitDatePicker = null;
        }

        setCommits(commits) {
          this.allCommits = commits;
        }

        getCommits() {
          return this.allCommits;
        }

        selectCommit(hash) {
          this.selectedHashes.add(hash);
        }

        deselectCommit(hash) {
          this.selectedHashes.delete(hash);
        }

        toggleCommitSelection(hash) {
          if (this.selectedHashes.has(hash)) {
            this.deselectCommit(hash);
          } else {
            this.selectCommit(hash);
          }
        }

        selectAllCommits() {
          this.selectedHashes = new Set(this.allCommits.map(c => c.hash));
        }

        deselectAllCommits() {
          this.selectedHashes.clear();
        }

        isCommitSelected(hash) {
          return this.selectedHashes.has(hash);
        }

        getSelectedHashes() {
          return Array.from(this.selectedHashes);
        }

        getSelectedCount() {
          return this.selectedHashes.size;
        }

        areAllSelected() {
          return this.selectedHashes.size === this.allCommits.length && this.allCommits.length > 0;
        }

        setMode(mode) {
          this.currentMode = mode;
        }

        getMode() {
          return this.currentMode;
        }

        setUpdateFlag(flag) {
          this.isUpdatingSelectAll = flag;
        }

        isUpdating() {
          return this.isUpdatingSelectAll;
        }

        setDatePickers(authorPicker, commitPicker) {
          this.authorDatePicker = authorPicker;
          this.commitDatePicker = commitPicker;
        }

        destroyDatePickers() {
          if (this.authorDatePicker) {
            this.authorDatePicker.destroy();
          }
          if (this.commitDatePicker) {
            this.commitDatePicker.destroy();
          }
        }
      }
    `;
  }
}

