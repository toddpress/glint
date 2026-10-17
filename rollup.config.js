import resolve from '@rollup/plugin-node-resolve';

export default commandLine => ({
  input: commandLine.configCodepen ? 'src/codepen.js' : 'src/index.js',
  output: {
    file: commandLine.configCodepen ? 'dist/glint.codepen.js' : 'dist/glint.js',
    format: 'esm',
    sourcemap: false,
    banner: '// Glint — https://github.com/toddpress/glint',
  },
  plugins: [resolve({ browser: true, dedupe: ['@preact/signals-core'] })],
  treeshake: { moduleSideEffects: false },
});
