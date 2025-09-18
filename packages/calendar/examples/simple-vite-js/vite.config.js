import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3003,
    open: true,
    host: true
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@ldesign/calendar': resolve(__dirname, '../../src/index.ts')
    }
  },
  
  // CSS配置
  css: {
    devSourcemap: true
  },
  
  // 优化配置
  optimizeDeps: {
    include: [
      'dayjs',
      'dayjs/plugin/localeData',
      'dayjs/plugin/weekOfYear',
      'dayjs/plugin/isoWeek',
      'dayjs/plugin/customParseFormat',
      'dayjs/plugin/advancedFormat',
      'dayjs/plugin/weekday',
      'dayjs/plugin/dayOfYear',
      'lunar-javascript'
    ]
  },
  
  // 定义全局变量
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __VERSION__: JSON.stringify('0.1.0')
  }
})
