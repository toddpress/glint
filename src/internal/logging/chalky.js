/** @typedef {{ text: string, style: string }} ChalkyPart */
/** @typedef {{ _isChalky: true, parts: ChalkyPart[] }} ChalkyMessage */
/** @typedef {string | number | boolean | null | undefined | ChalkyMessage} ChalkyInput */
/** @typedef {'log' | 'warn' | 'error'} ChalkyEmitType */

const STYLE_MAP = Object.freeze({
  // modifiers
  bold: 'font-weight:700;',
  italic: 'font-style:italic;',
  underline: 'text-decoration:underline;',
  dim: 'opacity:.65;',
  // colors
  black: 'color:#000;',
  red: 'color:#f00;',
  green: 'color:#0a0;',
  yellow: 'color:#aa0;',
  blue: 'color:#00f;',
  magenta: 'color:#f0f;',
  cyan: 'color:#0ff;',
  white: 'color:#fff;',
  gray: 'color:#808080;',
  grey: 'color:#808080;',
  // backgrounds
  bgBlack: 'background:#000;',
  bgRed: 'background:#f00;',
  bgGreen: 'background:#0a0;',
  bgYellow: 'background:#aa0;',
  bgBlue: 'background:#00f;',
  bgMagenta: 'background:#f0f;',
  bgCyan: 'background:#0ff;',
  bgWhite: 'background:#fff;',
  bgGray: 'background:#808080;',
  bgGrey: 'background:#808080;'
});

export const styles = STYLE_MAP;

export function emit(type, msg) {
  const format = msg.parts.map((p) => `%c${p.text}`).join('');
  const css = msg.parts.map((p) => p.style || '');
  console[type](format, ...css);
}

function makeStyler(active) {
  const css = active.join(' ');
  const commit = (...args) => {
    const parts = [];
    for (const a of args) {
      if (a && typeof a === 'object' && a._isChalky) parts.push(...a.parts);
      else parts.push({ text: String(a), style: css });
    }
    return { _isChalky: true, parts };
  };

  const proxy = new Proxy(commit, {
    get(_t, prop) {
      if (typeof prop === 'symbol') return undefined;
      if (prop === 'reset') return makeStyler([]);
      if (prop === 'log' || prop === 'warn' || prop === 'error') return (...a) => emit(prop, commit(...a));
      if (prop === 'theme') {
        return (defs) => {
          const themed = Object.create(proxy);
          for (const k of Object.keys(defs || {})) themed[k] = defs[k];
          return themed;
        };
      }
      const rule = STYLE_MAP[prop];
      if (rule) return makeStyler(active.concat(rule));
      return undefined;
    }
  });

  return proxy;
}

export function createStyler() {
  return makeStyler([]);
}
