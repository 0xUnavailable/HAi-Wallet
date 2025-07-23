// statusPoller.ts
// Polls for execution status using relay.link API

export class StatusPoller {
  async pollStatus(requestId: string, intervalMs = 3000, maxAttempts = 20) {
    // Poll the execution status endpoint until success/failure or maxAttempts
  }
} 