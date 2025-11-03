import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 框架自动检测为 React
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})
