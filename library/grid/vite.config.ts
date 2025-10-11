import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    vue(),
    react(),
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
      staticImport: true,
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'vanilla/index': resolve(__dirname, 'src/vanilla/index.ts'),
        'vue/index': resolve(__dirname, 'src/vue/index.ts'),
        'react/index': resolve(__dirname, 'src/react/index.tsx')
      },
      name: 'LGridStack',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', 'react', 'react-dom', 'gridstack'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React',
          'react-dom': 'ReactDOM',
          gridstack: 'GridStack'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name || ''
        }
      }
    },
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
