import { defineConfig } from '@ldesign/builder';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    dir: 'dist'
  },
  external: ['lit', 'lit/decorators.js'],
  dts: true,
  sourcemap: true,
  clean: true,
  name: 'LDesignIconsLit'
});
