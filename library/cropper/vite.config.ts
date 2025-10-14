import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'adapters/vue/index': resolve(__dirname, 'src/adapters/vue/index.ts'),
        'adapters/react/index': resolve(__dirname, 'src/adapters/react/index.tsx'),
        'adapters/angular/index': resolve(__dirname, 'src/adapters/angular/index.ts')
      },
      name: 'LDesignCropper',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `${entryName}.${ext}`
      }
    },
    rollupOptions: {
      external: ['vue', 'react', 'react-dom', 'react/jsx-runtime', '@angular/core', '@angular/common'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@angular/core': 'ng.core',
          '@angular/common': 'ng.common'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name || 'assets/[name][extname]'
        },
        exports: 'named'
      }
    },
    cssCodeSplit: false,
    emptyOutDir: true
  }
})
