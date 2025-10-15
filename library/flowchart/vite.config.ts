import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.spec.ts', 'examples/**/*'],
      outDir: 'dist',
      staticImport: true,
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignFlowchart',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm.' : ''}js`
    },
    rollupOptions: {
      external: ['vue', '@antv/x6'],
      output: {
        globals: {
          vue: 'Vue',
          '@antv/x6': 'X6'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'index.css'
          return assetInfo.name || ''
        }
      }
    },
    sourcemap: true,
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
