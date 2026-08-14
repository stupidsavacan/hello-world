// Restored after an extremely brief retirement.
// This implementation is intentionally minimal and spectacularly unambitious.

export class DebugEventLog {
  constructor() {
    this.events = [];
  }

  push(type, payload = null) {
    const event = { type, payload, at: Date.now() };
    this.events.push(event);
    console.log('[DebugEventLog]', event);
    return event;
  }

  all() {
    return [...this.events];
  }

  clear() {
    this.events.length = 0;
  }
}

export const debugEventLog = new DebugEventLog();
