import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        vue: resolve(__dirname, 'src/adapters/vue/index.ts'),
        react: resolve(__dirname, 'src/adapters/react/index.tsx'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: ['vue', 'react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // 代码分割优化
        manualChunks: (id) => {
          // CodeMirror 相关包单独打包（体积大）
          if (id.includes('@codemirror')) {
            // 区分核心和语言包
            if (id.includes('lang-')) {
              return 'codemirror-langs'
            }
            return 'codemirror-core'
          }
          
          // AI 相关单独打包
          if (id.includes('/src/ai/')) {
            return 'ai'
          }
          
          // 插件按类别打包
          if (id.includes('/src/plugins/')) {
            if (id.includes('/plugins/formatting/')) return 'plugins-formatting'
            if (id.includes('/plugins/media/')) return 'plugins-media'
            if (id.includes('/plugins/table/')) return 'plugins-table'
            return 'plugins-utils'
          }
          
          // UI 组件
          if (id.includes('/src/ui/')) {
            return 'ui'
          }
          
          // 核心模块
          if (id.includes('/src/core/')) {
            return 'core'
          }
        },
        globals: {
          vue: 'Vue',
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'editor.css'
          return assetInfo.name || ''
        },
        // 优化 chunk 命名
        chunkFileNames: 'chunks/[name]-[hash].js'
      }
    },
    cssCodeSplit: false,
    sourcemap: true,
    
    // 压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'logger.debug']
      },
      format: {
        // 移除注释
        comments: false
      }
    },
    
    // 其他优化
    chunkSizeWarningLimit: 1000, // 提高警告阈值到 1000KB
    
    // Rollup 优化
    rollupOptions: {
      ...{
        external: ['vue', 'react', 'react-dom', 'react/jsx-runtime'],
        output: {
          manualChunks: (id) => {
            if (id.includes('@codemirror')) {
              if (id.includes('lang-')) return 'codemirror-langs'
              return 'codemirror-core'
            }
            if (id.includes('/src/ai/')) return 'ai'
            if (id.includes('/src/plugins/')) {
              if (id.includes('/plugins/formatting/')) return 'plugins-formatting'
              if (id.includes('/plugins/media/')) return 'plugins-media'
              if (id.includes('/plugins/table/')) return 'plugins-table'
              return 'plugins-utils'
            }
            if (id.includes('/src/ui/')) return 'ui'
            if (id.includes('/src/core/')) return 'core'
          },
          globals: {
            vue: 'Vue',
            react: 'React',
            'react-dom': 'ReactDOM'
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') return 'editor.css'
            return assetInfo.name || ''
          },
          chunkFileNames: 'chunks/[name]-[hash].js'
        }
      },
      
      // Tree-shaking 优化
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@plugins': resolve(__dirname, 'src/plugins'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@config': resolve(__dirname, 'src/config')
    }
  },
  
  // 开发服务器优化
  server: {
    hmr: {
      overlay: true
    }
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'react', 'react-dom'],
    exclude: []
  }
})
