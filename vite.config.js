import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const path = (relative) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  root: path('./examples'),
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: [
        path('./examples/index.html'),
        path('./examples/basic/index.html'),
        path('./examples/pedalboard/index.html'),
      ],
    },
  },
});
