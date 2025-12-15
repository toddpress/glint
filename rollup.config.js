import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/glint.codepen.js',
    format: 'esm',
    sourcemap: false,
    banner: `
    // ============================================================
    //  Glint – CodePen Dev Bundle
    //  https://github.com/toddpress/glint
    // ============================================================
    `,
  },
  plugins: [resolve({
    browser: true,
    dedupe: ['@preact/signals-core'],
  })],
  treeshake: {
    moduleSideEffects: false
  }
};
