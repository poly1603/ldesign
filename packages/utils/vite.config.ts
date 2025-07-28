import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      skipDiagnostics: false,
      logDiagnostics: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignUtils',
      formats: ['es', 'umd'],
      fileName: (format) => `ldesign-utils.${format}.js`
    },
    rollupOptions: {
      external: [
        'lodash-es'
      ],
      output: {
        globals: {
          'lodash-es': '_'
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts']
  }
})