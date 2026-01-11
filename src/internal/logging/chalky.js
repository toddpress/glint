const STYLE_MAP = Object.freeze({
  // modifiers
  bold: 'font-weight:700;',
  italic: 'font-style:italic;',
  underline: 'text-decoration:underline;',
  dim: 'opacity:.65;',
  code: 'font-family:monospace;',

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

// Chalky returns *style intents*, not strings.
// Each invocation produces a plain object describing intent.
function createChalky(activeStyles = []) {
  return new Proxy(
    // Invocation: chalky.bold('text')
    function chalk(text) {
      return {
        __styleIntent: true,
        styleHints: activeStyles,
        text,
      }
    },
    {
      // Property access: chalky.bold.dim.italic
      get(_, prop) {
        if (!(prop in STYLE_MAP)) return undefined
        return createChalky([...activeStyles, STYLE_MAP[prop]])
      }
    }
  )
}

// Public chalky instance
export const chalky = createChalky()
