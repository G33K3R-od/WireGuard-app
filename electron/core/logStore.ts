import type { LogEntry } from "../shared/types";

const MAX_LOGS = 500;

export class LogStore {
  private readonly items: LogEntry[] = [];

  push(level: LogEntry["level"], message: string): void {
    this.items.push({ level, message, ts: new Date().toISOString() });
    if (this.items.length > MAX_LOGS) {
      this.items.splice(0, this.items.length - MAX_LOGS);
    }
  }

  list(): LogEntry[] {
    return [...this.items].reverse();
  }
}
