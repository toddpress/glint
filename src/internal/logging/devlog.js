import { createStyler } from './chalky';

const c = createStyler();

/**
 * Visual language — fixed, intentional
 */
const ui = c.theme({
  badge: c.bold.bgBlack.white,
  info: c.cyan.bold,
  warn: c.yellow.bold,
  error: c.red.bold,
  debug: c.magenta.bold,
  dim: c.dim,
});

/**
 * Internal helper
 */
function emit(level, badge, args) {
  const parts = [
    ui.badge(`${badge}`),
    ' ',
    ...args
  ];

  ui[level].log(...parts);
}

/**
 * Public logger
 */
export const devlog = Object.freeze({
  info(...args) {
    emit('info', 'GLINT', args);
  },

  warn(...args) {
    emit('warn', 'GLINT WARN', args);
  },

  error(...args) {
    emit('error', 'GLINT ERROR', args);
  },

  debug(...args) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return;
    emit('debug', 'GLINT DEBUG', args);
  }
});
