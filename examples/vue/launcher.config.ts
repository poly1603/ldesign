import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 框架自动检测为 Vue 3
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})
