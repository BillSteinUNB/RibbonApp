type LogFn = (...args: unknown[]) => void;

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const noop: LogFn = () => {};

function bindConsole(fn: LogFn | undefined): LogFn {
  if (!fn) return noop;
  return fn.bind(console);
}

export const logger = {
  debug: isDev ? bindConsole(console.debug ?? console.log) : noop,
  info: isDev ? bindConsole(console.info ?? console.log) : noop,
  warn: isDev ? bindConsole(console.warn) : noop,
  error: isDev ? bindConsole(console.error) : noop,
  log: isDev ? bindConsole(console.log) : noop,
};
