import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    // 暂时禁用DTS插件避免类型错误
    // dts({
    //   insertTypesEntry: true,
    //   cleanVueFileName: true,
    //   skipDiagnostics: true,
    //   logDiagnostics: false,
    //   noEmitOnError: false,
    //   rollupTypes: true,
    // }),
  ],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignForm',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        const ext = format === 'es' ? 'mjs' : 'cjs'
        return `index.${ext}`
      },
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'index.css'
          }
          return assetInfo.name || 'asset'
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
    cssCodeSplit: false,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
  },
})
