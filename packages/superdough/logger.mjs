let log = (msg) => console.log(msg);

export function errorLogger(e, origin = 'superdough') {
  if (process.env.NODE_ENV === 'development') {
    console.error(e);
  }
  logger(`[${origin}] error: ${e.message}`);
}

export const logger = (...args) => log(...args);

export const setLogger = (fn) => {
  log = fn;
};
