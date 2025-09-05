import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue()
    // TODO: 修复类型错误后重新启用 DTS 插件
    // dts({
    //   insertTypesEntry: true,
    //   cleanVueFileName: true,
    //   skipDiagnostics: false,
    //   logDiagnostics: true,
    //   rollupTypes: true,
    //   include: ['src/**/*'],
    //   exclude: ['src/**/*.test.*', 'src/**/*.spec.*']
    // })
  ],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignForm',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', 'lodash-es'],
      output: {
        globals: {
          vue: 'Vue',
          'lodash-es': 'lodash'
        },
        exports: 'named'
      }
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2018'
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/vue': resolve(__dirname, 'src/vue'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/validators': resolve(__dirname, 'src/validators'),
      '@/legacy': resolve(__dirname, 'src/legacy')
    }
  },

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },



  server: {
    port: 5173,
    open: true
  }
})
