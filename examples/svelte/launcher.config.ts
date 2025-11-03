import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 框架自动检测为 Svelte
  server: {
    port: 3003,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})
