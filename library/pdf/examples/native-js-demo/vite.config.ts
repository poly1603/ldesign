import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  server: {
    fs: {
      // 允许访问到 monorepo 工作区根目录，便于从 packages/pdf/src 引用源码
      allow: [
        path.resolve(__dirname, '../../../'),
      ],
    },
  },
})

