import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: __dirname,
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: [
      // 将包名精确指向入口文件，确保可解析
      { find: /^@ldesign\/progress$/, replacement: path.resolve(__dirname, '../src/index.ts') },
      // 同时支持子路径导入
      { find: /^@ldesign\/progress\/(.*)$/, replacement: path.resolve(__dirname, '../src/$1') }
    ]
  }
})

