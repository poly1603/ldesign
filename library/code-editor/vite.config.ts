import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist',
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: {
        'code-editor': resolve(__dirname, 'src/index.ts'),
        'vue': resolve(__dirname, 'src/adapters/vue/index.ts')
      },
      name: 'LDesignCodeEditor',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'monaco-editor'],
      output: {
        globals: {
          vue: 'Vue',
          'monaco-editor': 'monaco'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css'
          }
          return assetInfo.name || ''
        }
      }
    },
    cssCodeSplit: false,
    sourcemap: true,
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
