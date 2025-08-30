import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: 'test-library',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  minify: true,
  sourcemap: true,
  external: ['vue', 'react'],
  globals: {
    vue: 'Vue',
    react: 'React',
  },
  outDir: 'dist',
  clean: true,
})
