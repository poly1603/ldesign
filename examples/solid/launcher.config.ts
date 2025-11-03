import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 框架自动检测为 Solid
  server: {
    port: 3002,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})
