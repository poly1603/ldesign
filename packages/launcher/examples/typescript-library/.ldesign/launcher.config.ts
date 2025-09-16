import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLibrary',
      fileName: 'my-library',
      formats: ['es', 'cjs', 'umd']
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  },
  launcher: {
    logLevel: 'info',
    mode: 'production'
  }
})
