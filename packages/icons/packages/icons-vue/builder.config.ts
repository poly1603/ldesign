import { defineConfig } from '@ldesign/builder';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    dir: {
      esm: 'es',
      cjs: 'lib',
      umd: 'dist'
    }
  },
  external: ['vue'],
  dts: true,
  sourcemap: true,
  clean: true,
  name: 'LDesignIconsVue'
});
