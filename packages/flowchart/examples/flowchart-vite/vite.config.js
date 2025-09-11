import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 规避 @logicflow/extension 间接引入的 vue-demi 对 Vue2 Composition API 的硬依赖
// 我们在纯 JS 示例中并不实际使用 Vue2/Composition API，这里提供一个最小 stub

// 智能别名：优先使用 dist，其次回退到 src（并提供路径重写）
const libSrcDir = path.resolve(__dirname, '../../src')
const libDistEntry = path.resolve(__dirname, '../../dist/index.js')
const useDist = fs.existsSync(libDistEntry)

const alias = [
  { find: '@vue/composition-api/dist/vue-composition-api.mjs', replacement: '/src/shims/vue-composition-api.mjs' },
  { find: '@ldesign/flowchart', replacement: useDist ? libDistEntry : path.resolve(libSrcDir, 'index.ts') },
]

if (!useDist) {
  // 仅在引用源码时提供 @ 前缀与 .js → .ts 的重写
  alias.push(
    { find: /^@\//, replacement: libSrcDir + '/' },
    { find: /^@\/([^?]*?)\.js(\?.*)?$/, replacement: libSrcDir + '/$1.ts' },
  )
}

export default defineConfig({
  resolve: {
    alias,
  },
  optimizeDeps: {
    exclude: ['vue-demi', '@vue/composition-api'],
  },
  server: {
    fs: {
      allow: [
        '..',
        '../..'
      ]
    }
  }
})

