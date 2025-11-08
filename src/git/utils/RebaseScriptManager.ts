import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Manages temporary rebase scripts
 * Handles creation, cleanup, and execution of git rebase sequence editor scripts
 */
export class RebaseScriptManager {
  private scriptPath: string | null = null;

  /**
   * Create a temporary rebase script
   * @param action The rebase action (edit, reword, etc.)
   * @param commitHash The commit hash to target
   */
  createScript(action: 'edit' | 'reword', commitHash: string): string {
    const tmpDir = os.tmpdir();
    this.scriptPath = path.join(tmpDir, `git-rebase-script-${Date.now()}.sh`);

    const shortHash = commitHash.substring(0, 7);
    const script = `#!/bin/sh
sed -i.bak "s/^pick ${shortHash}/${action} ${shortHash}/" "$1"
`;

    fs.writeFileSync(this.scriptPath, script, { mode: 0o755 });
    return this.scriptPath;
  }

  /**
   * Clean up the temporary script file
   */
  cleanup(): void {
    if (this.scriptPath && fs.existsSync(this.scriptPath)) {
      try {
        fs.unlinkSync(this.scriptPath);
        
        // Also try to clean up the backup file created by sed
        const backupPath = `${this.scriptPath}.bak`;
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath);
        }
      } catch (error) {
        // Ignore cleanup errors
      }
      this.scriptPath = null;
    }
  }

  /**
   * Execute an operation with automatic script cleanup
   */
  async withScript<T>(
    action: 'edit' | 'reword',
    commitHash: string,
    operation: (scriptPath: string) => Promise<T>
  ): Promise<T> {
    try {
      const scriptPath = this.createScript(action, commitHash);
      return await operation(scriptPath);
    } finally {
      this.cleanup();
    }
  }
}

