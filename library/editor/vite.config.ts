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
    cssCodeSplit: false,
    sourcemap: true,
    
    // 压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'logger.debug'],
        passes: 2
      },
      format: {
        comments: false
      },
      mangle: {
        safari10: true
      }
    },
    
    // chunk大小警告
    chunkSizeWarningLimit: 1000,
    
    // Rollup优化
    rollupOptions: {
      external: ['vue', 'react', 'react-dom', 'react/jsx-runtime'],
      
      output: {
        // 精细化代码分割
        manualChunks: (id) => {
          // CodeMirror（最大的依赖）
          if (id.includes('@codemirror')) {
            if (id.includes('lang-')) return 'codemirror-langs'
            return 'codemirror-core'
          }
          
          // AI功能（独立加载）
          if (id.includes('/src/ai/')) {
            if (id.includes('/providers/')) return 'ai-providers'
            return 'ai-core'
          }
          
          // 插件（按类别分割）
          if (id.includes('/src/plugins/')) {
            if (id.includes('/formatting/')) return 'plugins-formatting'
            if (id.includes('/media/')) return 'plugins-media'
            if (id.includes('/table/')) return 'plugins-table'
            if (id.includes('/ai/')) return 'plugins-ai'
            return 'plugins-utils'
          }
          
          // UI组件（独立）
          if (id.includes('/src/ui/')) {
            if (id.includes('/base/')) return 'ui-base'
            if (id.includes('/icons/')) return 'ui-icons'
            return 'ui-components'
          }
          
          // 核心模块（最重要）
          if (id.includes('/src/core/')) {
            return 'core'
          }
          
          // 工具函数
          if (id.includes('/src/utils/')) {
            return 'utils'
          }
          
          // 图标和主题
          if (id.includes('/src/icons/') || id.includes('/src/theme/')) {
            return 'theme-icons'
          }
        },
        
        globals: {
          vue: 'Vue',
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'editor.css'
          return '[name].[ext]'
        },
        
        chunkFileNames: 'chunks/[name]-[hash].js',
        
        // 优化导出
        exports: 'named',
        
        // 保留模块结构
        preserveModules: false,
        
        // 压缩选项
        compact: true
      },
      
      // Tree-shaking优化
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
        annotations: true
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
