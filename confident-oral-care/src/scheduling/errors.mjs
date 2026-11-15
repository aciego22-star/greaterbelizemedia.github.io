export class CalendarUnavailableError extends Error {
  constructor(message = 'Calendar unavailable') {
    super(message);
    this.name = 'CalendarUnavailableError';
  }
}

export class CalendarTimeoutError extends Error {
  constructor(message = 'Calendar request timed out') {
    super(message);
    this.name = 'CalendarTimeoutError';
  }
}

/** Another booking already holds this resource and start time. */
export class SlotConflictError extends Error {
  constructor(message = 'Slot already taken') {
    super(message);
    this.name = 'SlotConflictError';
  }
}
