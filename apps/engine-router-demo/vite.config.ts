import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/engine': resolve(__dirname, '../../packages/engine/src'),
      '@ldesign/router': resolve(__dirname, '../../packages/router/src'),
      // 配置Vue支持模板编译
      'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  define: {
    // 启用Vue模板编译
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
})
