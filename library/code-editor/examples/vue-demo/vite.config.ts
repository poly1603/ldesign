import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/code-editor': resolve(__dirname, '../../src/index.ts'),
      '@ldesign/code-editor/vue': resolve(__dirname, '../../src/adapters/vue/index.ts')
    }
  },
  server: {
    port: 3001
  }
})
