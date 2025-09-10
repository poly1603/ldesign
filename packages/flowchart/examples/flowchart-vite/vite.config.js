import { defineConfig } from 'vite'

// 规避 @logicflow/extension 间接引入的 vue-demi 对 Vue2 Composition API 的硬依赖
// 我们在纯 JS 示例中并不实际使用 Vue2/Composition API，这里提供一个最小 stub
export default defineConfig({
  resolve: {
    alias: {
      '@vue/composition-api/dist/vue-composition-api.mjs': '/src/shims/vue-composition-api.mjs',
    },
  },
  optimizeDeps: {
    exclude: ['vue-demi', '@vue/composition-api'],
  },
})

