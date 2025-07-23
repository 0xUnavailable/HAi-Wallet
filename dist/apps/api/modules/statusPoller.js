"use strict";
// statusPoller.ts
// Polls for execution status using relay.link API
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusPoller = void 0;
class StatusPoller {
    async pollStatus(requestId, intervalMs = 3000, maxAttempts = 20) {
        // Poll the execution status endpoint until success/failure or maxAttempts
    }
}
exports.StatusPoller = StatusPoller;
