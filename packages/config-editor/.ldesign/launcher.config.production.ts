/**
 * 生产环境配置文件
 *
 * 主要配置生产环境特有的代理设置，其他配置继承自 launcher.config.ts
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 继承基础配置中的 launcher 预设和 alias 配置
  launcher: {
    preset: 'ldesign'
  },

  // 生产环境服务器配置
  server: {
    port: 3000,
    open: false, // 生产环境不自动打开浏览器
    host: true
  },

  // 生产环境代理配置已移除
  // 在preview模式下，应该直接服务本地构建的静态文件
  // 真正的生产环境代理应该通过nginx等反向代理来处理

  // 生产环境构建配置
  build: {
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ldesign: [
            '@ldesign/api',
            '@ldesign/http',
            '@ldesign/cache',
            '@ldesign/crypto'
          ]
        }
      }
    }
  },

  // 生产环境环境变量
  define: {
    __DEV__: false,
    __ENVIRONMENT__: '"production"'
  }
})
