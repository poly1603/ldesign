import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 框架自动检测为 Angular
  server: {
    port: 3004,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})
