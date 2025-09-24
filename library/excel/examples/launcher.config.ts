import { defineConfig } from '../../../packages/launcher/dist/index.js'

export default defineConfig({
  // 项目基本信息
  name: 'Excel Editor Example',
  description: 'LDesign Excel编辑器示例项目',
  version: '1.0.0',

  // 入口文件
  entry: 'src/main.ts',

  // HTML模板
  template: 'index.html',

  // 输出目录
  outDir: 'dist',

  // 开发服务器配置
  server: {
    port: 3001,
    host: '0.0.0.0',
    open: true
  },

  // 构建配置
  build: {
    target: 'es2020',
    sourcemap: true,
    minify: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['xlsx']
        }
      }
    }
  },

  // 插件配置
  plugins: [
    // 支持TypeScript
    'typescript',
    // 支持Less
    'less',
    // 支持HTML模板
    'html'
  ],

  // 别名配置
  alias: {
    '@': './src',
    '@ldesign/excel-editor': '../src/index.ts'
  },

  // CSS配置
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // 可以在这里覆盖LDesign的CSS变量
        }
      }
    }
  },

  // 环境变量
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __VERSION__: JSON.stringify('1.0.0')
  },

  // 优化配置
  optimizeDeps: {
    include: ['xlsx']
  },

  // 预览配置
  preview: {
    port: 3001,
    host: '0.0.0.0'
  }
})
