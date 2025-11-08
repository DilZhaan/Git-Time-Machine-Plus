import { GitCommit } from '../../types';

/**
 * Utility for parsing git log output into GitCommit objects
 */
export class CommitParser {
  /**
   * Parse a single git log line into a GitCommit object
   * Expected format: hash|author|email|timestamp|message
   */
  static parseCommit(line: string): GitCommit | null {
    const parts = line.split('|');
    if (parts.length < 5) {
      return null;
    }

    const [hash, author, email, timestamp, ...messageParts] = parts;
    const message = messageParts.join('|'); // In case message contains |

    const timestampNum = parseInt(timestamp.trim(), 10);
    if (isNaN(timestampNum)) {
      return null;
    }

    return {
      hash: hash.trim(),
      shortHash: hash.trim().substring(0, 7),
      author: author.trim(),
      authorEmail: email.trim(),
      timestamp: timestampNum,
      date: new Date(timestampNum * 1000),
      message: message.trim(),
      isPushed: false,
    };
  }

  /**
   * Parse multiple git log lines
   */
  static parseCommits(output: string): GitCommit[] {
    if (!output.trim()) {
      return [];
    }

    return output
      .trim()
      .split('\n')
      .map((line) => this.parseCommit(line))
      .filter((commit): commit is GitCommit => commit !== null);
  }
}

