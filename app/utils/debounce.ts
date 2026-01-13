/**
 * Debounce and Throttle utilities
 */

/**
 * Debounce function - delays execution until after wait time has elapsed
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    const context = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Throttle function - limits execution to once per wait duration
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    const context = this;
    const now = Date.now();

    if (now - lastRun >= wait) {
      lastRun = now;
      func.apply(context, args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        lastRun = Date.now();
        func.apply(context, args);
      }, wait - (now - lastRun));
    }
  };
}

/**
 * Create a debounced version that can be cancelled
 */
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  fn: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounced = function (this: any, ...args: Parameters<T>): void {
    const context = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(context, args);
      timeoutId = null;
    }, wait);
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const flush = () => {
    cancel();
    // Immediate execution is not supported by the basic debounce implementation
    // If you need this functionality, use a more sophisticated debounce library
  };

  return { fn: debounced, cancel, flush };
}

/**
 * Create a throttled version that can be cancelled
 */
export function createThrottledFunction<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  fn: (...args: Parameters<T>) => void;
  cancel: () => void;
} {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  const throttled = function (this: any, ...args: Parameters<T>): void {
    const context = this;
    const now = Date.now();

    if (now - lastRun >= wait) {
      lastRun = now;
      func.apply(context, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastRun = Date.now();
        func.apply(context, args);
        timeoutId = null;
      }, wait - (now - lastRun));
    }
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { fn: throttled, cancel };
}
