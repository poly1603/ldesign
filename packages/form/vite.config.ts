import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      cleanVueFileName: true,
      skipDiagnostics: false,
      logDiagnostics: true,
      rollupTypes: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*']
    })
  ],

  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        core: resolve(__dirname, 'src/core/index.ts'),
        vue: resolve(__dirname, 'src/vue/index.ts'),
        utils: resolve(__dirname, 'src/utils/index.ts')
      },
      name: 'LemonForm',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
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
      '@': resolve(__dirname, 'src')
    }
  },

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts']
  },

  server: {
    port: 5173,
    open: true
  }
})
