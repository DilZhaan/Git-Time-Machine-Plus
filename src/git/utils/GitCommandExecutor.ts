import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Centralized executor for git commands
 * Provides a consistent interface for executing git commands with error handling
 */
export class GitCommandExecutor {
  constructor(private readonly workspaceRoot: string) {}

  /**
   * Execute a git command in the workspace
   */
  async execute(
    command: string,
    options: { env?: NodeJS.ProcessEnv } = {}
  ): Promise<string> {
    try {
      const { stdout } = await execAsync(command, {
        cwd: this.workspaceRoot,
        env: { ...process.env, ...options.env },
      });
      return stdout.trim();
    } catch (error: any) {
      throw new Error(`Git command failed: ${command}\n${error.message}`);
    }
  }

  /**
   * Execute a git command that may fail gracefully
   * Returns null instead of throwing on error
   */
  async executeOrNull(
    command: string,
    options: { env?: NodeJS.ProcessEnv } = {}
  ): Promise<string | null> {
    try {
      return await this.execute(command, options);
    } catch (error) {
      return null;
    }
  }

  /**
   * Execute a git command silently (suppress errors)
   */
  async executeSilent(
    command: string,
    options: { env?: NodeJS.ProcessEnv } = {}
  ): Promise<void> {
    try {
      await this.execute(command, options);
    } catch (error) {
      // Silently ignore errors
    }
  }

  /**
   * Get the workspace root
   */
  getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }
}

