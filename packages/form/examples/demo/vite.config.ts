import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 将所有以 query- 开头的标签视为自定义元素
          isCustomElement: (tag) => tag.startsWith('query-')
        }
      }
    })
  ],
  root: '.',
  base: '/',
  server: {
    port: 3000,
    host: true,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/form': resolve(__dirname, '../../src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'lit', '@ldesign/form']
  },
  esbuild: {
    target: 'es2020'
  }
})
